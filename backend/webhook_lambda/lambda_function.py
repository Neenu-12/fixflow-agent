import json
import base64
import hmac
import hashlib
import boto3
import os
import jwt
import time
import requests
import zipfile
from io import BytesIO
import re
from botocore.exceptions import ClientError

dynamodb = boto3.resource("dynamodb")
bedrock = boto3.client("bedrock-runtime", region_name="ap-south-1")
table = dynamodb.Table("ci_failures")

WEBHOOK_SECRET = os.environ["GITHUB_WEBHOOK_SECRET"]
GITHUB_APP_ID = os.environ["GITHUB_APP_ID"]
GITHUB_PRIVATE_KEY = os.environ["GITHUB_PRIVATE_KEY"]

MODEL_USED = "apac.amazon.nova-lite-v1:0"

def verify_signature(payload_body, signature_header):
    if not signature_header:
        return False

    hash_object = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload_body.encode(),
        hashlib.sha256
    )

    expected_signature = "sha256=" + hash_object.hexdigest()
    return hmac.compare_digest(expected_signature, signature_header)

def generate_github_app_jwt():

    app_id = GITHUB_APP_ID
    private_key = GITHUB_PRIVATE_KEY

    now = int(time.time())

    payload = {
        "iat": now,
        "exp": now + 600,    # JWT expiration (max 10 minutes)
        "iss": app_id
    }

    encoded_jwt = jwt.encode(
        payload,
        private_key,
        algorithm="RS256"
    )

    if isinstance(encoded_jwt, bytes):
        encoded_jwt = encoded_jwt.decode("utf-8")

    return encoded_jwt

def generate_github_installation_access_token(github_jwt_token, installation_id):
    url = f"https://api.github.com/app/installations/{installation_id}/access_tokens"

    headers = {
        "Authorization": f"Bearer {github_jwt_token}",
        "Accept": "application/vnd.github.v3+json"
    }

    response = requests.post(url, headers=headers)

    if response.status_code != 201:
        raise Exception(f"Failed to generate access token: {response.status_code} - {response.text}")

    data = response.json()
    return data["token"]

def download_ci_logs(repository_full_name, workflow_run_id, installation_access_token):
    url = f"https://api.github.com/repos/{repository_full_name}/actions/runs/{workflow_run_id}/logs"
    # 'Neenu-12/fixflow-demo-repo'

    headers = {
        "Authorization": f"Bearer {installation_access_token}",
        "Accept": "application/vnd.github+json"
    }

    print(f"Downloading logs for run_id={workflow_run_id}")

    response = requests.get(url, headers=headers)

    print("GitHub response status:", response.status_code)

    if response.status_code != 200:
        raise Exception(f"Failed to download CI logs: {response.status_code} - {response.text}")

    destination_dir = f"/tmp/ci_logs_{workflow_run_id}"
    os.makedirs(destination_dir, exist_ok=True)

    with zipfile.ZipFile(BytesIO(response.content)) as zfile:
        file_names = zfile.namelist()
        print("Files in CI archive:", file_names)

        zfile.extractall(destination_dir)

    print(f"Extraction complete. Logs saved to {destination_dir}")

    return destination_dir

def combine_ci_logs(log_directory):

    combined_logs = []

    for root, dirs, files in os.walk(log_directory):
        for file in files:

            file_path = os.path.join(root, file)

            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:

                    content = f.read()

                    combined_logs.append(f"\n===== {file} =====\n")
                    combined_logs.append(content)

            except Exception as e:
                print(f"Failed to read {file_path}: {e}")

    return "\n".join(combined_logs)

def extract_failure_snippet(log_text, context_before=20, context_after=10, max_scan_lines=3000):

    # Remove ANSI color codes
    ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
    clean_logs = ansi_escape.sub('', log_text)

    # Split logs into lines
    lines = clean_logs.splitlines()

    # Limit search to last N lines for performance
    start_index = max(0, len(lines) - max_scan_lines)

    # Generic failure patterns (language-agnostic)
    failure_patterns = [
        r"error:",
        r"exception",
        r"failed",
        r"fatal",
        r"panic",
        r"traceback",
        r"not found",
        r"cannot",
        r"denied",
        r"segmentation fault",
        r"exit code [1-9]"
    ]

    combined_regex = re.compile("|".join(failure_patterns), re.IGNORECASE)

    important_blocks = []

    # Scan logs from bottom → top
    for i in range(len(lines) - 1, start_index - 1, -1):

        if combined_regex.search(lines[i]):

            start = max(0, i - context_before)
            end = min(len(lines), i + context_after)

            block = "\n".join(lines[start:end])
            important_blocks.append(block)

            # Keep only 2 blocks to avoid confusing the LLM
            if len(important_blocks) >= 2:
                break

    # If no failure pattern found
    if not important_blocks:
        print("No failure keyword detected, returning last 50 lines.")
        return "\n".join(lines[-50:])

    # Return blocks in correct chronological order
    return "\n\n---\n\n".join(reversed(important_blocks))

def get_repo_tree(repository_full_name, commit_sha, installation_token):

    url = f"https://api.github.com/repos/{repository_full_name}/git/trees/{commit_sha}?recursive=1"

    headers = {
        "Authorization": f"Bearer {installation_token}",
        "Accept": "application/vnd.github+json"
    }

    r = requests.get(url, headers=headers)

    if r.status_code != 200:
        raise Exception(f"Failed to fetch repo tree: {r.text}")

    data = r.json()

    files = []

    for item in data["tree"]:
        if item["type"] == "blob":
            files.append(item["path"])

    return files

def format_repo_tree(files, max_files=200):
    trimmed = files[:max_files]

    return "\n".join(trimmed)

def build_file_selection_prompt(log_snippet, repo_tree):
    prompt = f"""
                You are a CI debugging assistant.
                A CI pipeline has failed.

                Failure logs:
                ----------------
                {log_snippet}
                ----------------

                Repository files:
                ----------------
                {repo_tree}
                ----------------

                From the repository structure, select the files that are most likely related to this failure.

                Return ONLY a JSON list of file paths.

                Limit to maximum 5 files.
            """

    return prompt

def call_llm(prompt):
    body = {
        "messages": [
            {
                "role": "user",
                "content": [{"text": prompt}]
            }
        ],
        "inferenceConfig": {
            "maxTokens": 500,
            "temperature": 0.2
        }
    }   

    response = bedrock.invoke_model(
        modelId=MODEL_USED,
        body=json.dumps(body)
    )

    result = json.loads(response["body"].read())

    return result["output"]["message"]["content"][0]["text"]

def parse_selected_files(llm_output):
    try:
        match = re.search(r"\[.*\]", llm_output, re.S)

        if not match:
            return []

        files = json.loads(match.group())

        print("files selected by LLM:", files)

        return files[:5]

    except Exception as e:
        print("Parsing failed:", e)
        print("Raw output:", llm_output)

        return []

def fetch_files(repository_full_name, files, commit_sha, installation_token):
    repo_files = {}

    for file in files:
        content = fetch_file_content(repository_full_name, file, commit_sha, installation_token)

        if content:
            repo_files[file] = content[:4000]

    return repo_files

def fetch_file_content(repository_full_name, path, commit_sha, installation_token):
    url = f"https://api.github.com/repos/{repository_full_name}/contents/{path}"

    headers = {
        "Authorization": f"Bearer {installation_token}",
        "Accept": "application/vnd.github+json"
    }

    params = {
        "ref": commit_sha
    }

    response = requests.get(url, headers=headers, params=params)

    if response.status_code != 200:
        print("Am i here !!!")
        return None

    data = response.json()

    content = base64.b64decode(data["content"]).decode()

    return content

def build_fix_prompt(log_snippet, repo_files, workflow_run_head_sha):

    files_text = ""
    short_sha = workflow_run_head_sha[:6]

    for path, content in repo_files.items():
        files_text += f"\nFILE: {path}\n"
        files_text += "-----------------\n"
        files_text += content
        files_text += "\n"

    prompt = f"""
        You are an expert software engineer and CI debugging assistant.
        A CI pipeline has failed. Your job is to analyze the failure logs and propose a minimal code fix.

        FAILURE LOGS:
        ----------
        {log_snippet}

        REPOSITORY FILES:
        ----------
        Below are the contents of files from the repository.
        {files_text}

        TASK:
        1. Identify the root cause of the CI failure.
        2. Fix the issue by modifying ONLY the files whose contents are provided above.
        3. Generate a branch name and commit message for the automated fix.

        RULES:
        - You may ONLY modify files whose contents are shown above.
        - Do NOT invent new files.
        - Do NOT remove unrelated code.
        - Preserve all existing content unless it must change.
        - When modifying a file, return the COMPLETE updated file content.

        COMMIT INFORMATION:
        Commit short SHA: {short_sha}

        BRANCH NAME RULES:
        Branch name must follow this format:

        ai-fix/<short-root-cause>-{short_sha}

        Where:
        - <short-root-cause> = short description of the issue
        - <short_sha> = first 6 characters of the commit SHA
        - lowercase only
        - use hyphens
        - no spaces
        - max 50 characters

        COMMIT MESSAGE RULES:
        Use conventional commit format.

        Format:
        fix: <short explanation of the fix>

        IMPORTANT INSTRUCTION:
        Each file already contains existing content.
        You MUST start from the original file content and modify it.

        Do NOT return only the new lines.

        The new_content MUST contain the "entire modified file".

        Example:

        Original file:
        flask
        pytest

        If pandas must be added, the correct new_content is:
        flask
        pytest
        pandas

        NOT:
        pandas

        RISK SCORING:
        - low = small code change (<10 lines)
        - medium = dependency change or configuration change
        - high = workflow, infrastructure, or major code change

        OUTPUT FORMAT:

        The JSON MUST follow EXACTLY this structure:

        {{
        "analysis": "Short explanation of the root cause",

        "files_to_modify": [
            {{
            "file": "path/to/file",
            "original_content": "original file content",
            "new_content": "complete updated file content"
            }}
        ],

        "branch_name": "ai-fix/root-cause-{short_sha}",
        "commit_message": "fix: short explanation of the fix",

        "confidence_score": 0-100,
        "risk_score": "low | medium | high"
        }}

        IMPORTANT:
        - confidence_score and risk_score MUST be at the top level
        - files_to_modify objects must NOT contain confidence_score or risk_score
        - new_content MUST contain the entire updated file content
        """

    return prompt

def parse_llm_fix(llm_output):

    try:

        cleaned = llm_output.replace("```json", "").replace("```", "")
        cleaned = cleaned.strip()

        # Fix invalid escape sequences
        cleaned = cleaned.replace("\\'", "'")

        match = re.search(r"\{.*\}", cleaned, re.S)

        if not match:
            print("No JSON object found")
            return None

        data = json.loads(match.group())

        return data

    except Exception as e:
        print("Failed to parse LLM output:")
        print("Error:", e)
        print("Raw output:", llm_output)

        return None

def mark_commit_resolved(failure_id):
    try:
        table.update_item(
            Key={"failure_id": failure_id},
            UpdateExpression="""
                SET #status = :status,
                    updated_at = :time
            """,
            ExpressionAttributeNames={
                "#status": "status"
            },
            ExpressionAttributeValues={
                ":status": "resolved",
                ":time": int(time.time())
            },
            ConditionExpression="attribute_exists(failure_id)"
        )

        print("Commit marked as resolved:", failure_id)

    except ClientError as exce:

        if exce.response["Error"]["Code"] == "ConditionalCheckFailedException":
            print("No failure record found for commit, ignoring")
            return

        raise

def acquire_processing_lock(failure_id, repo, run_id, commit_sha, branch):
    now = int(time.time())
    ttl = now + (30 * 24 * 60 * 60)  # 30 days
    try:
        table.put_item(
            Item={
                "failure_id": failure_id,
                "repo_name": repo,
                "workflow_run_id": str(run_id),
                "commit_sha": commit_sha,
                "branch": branch,
                "status": "processing",
                "created_at": now,
                "updated_at": now,
                "ttl": ttl
            },
            ConditionExpression="attribute_not_exists(failure_id)"
        )

        print("Processing lock acquired:", failure_id)
        return True

    except ClientError as exce:

        if exce.response["Error"]["Code"] == "ConditionalCheckFailedException":
            print("Duplicate event ignored:", failure_id)
            return False

        raise

def update_failure_analysis(failure_id, failure_snippet, fix):

    table.update_item(
        Key={"failure_id": failure_id},
        UpdateExpression="""
            SET failure_log_snippet = :log,
                root_cause = :cause,
                files_to_modify = :files,
                branch_name = :branch,
        commit_message = :commit,
                confidence_score = :confidence,
                risk_score = :risk,
                model_used = :model,
                #status = :status,
                updated_at = :time
        """,
        ExpressionAttributeNames={
            "#status": "status"
        },
        ExpressionAttributeValues={
            ":log": failure_snippet,
            ":cause": fix["analysis"],
            ":files": fix["files_to_modify"],
            ":branch": fix["branch_name"],
            ":commit": fix["commit_message"],
            ":confidence": fix["confidence_score"],
            ":risk": fix["risk_score"],
            ":model": MODEL_USED,
            ":status": "pending_approval",
            ":time": int(time.time())
        }
    )

def lambda_handler(event, context):
    # print("Raw event:", json.dumps(event))

    body = event.get("body", "")
    headers = event.get("headers", {})

    signature = headers.get("x-hub-signature-256") or headers.get("X-Hub-Signature-256")

    # Verify GitHub signature
    if not verify_signature(body, signature):
        return {
            "statusCode": 401,
            "body": json.dumps({"message": "Invalid signature"})
        }

    payload = json.loads(body)

    if payload.get("action") != "completed":
        return success("Ignored: CI run not completed")

    workflow = payload.get("workflow_run", {})

    repository_full_name = payload["repository"]["full_name"]
    workflow_run_id = payload["workflow_run"]["id"]
    workflow_run_head_sha = payload["workflow_run"]["head_sha"]
    workflow_run_head_branch = payload["workflow_run"]["head_branch"]
    workflow_run_conclusion = payload["workflow_run"]["conclusion"]
    installation_id = payload["installation"]["id"]
    conclusion = workflow.get("conclusion")

    failure_id = f"{repository_full_name}-{workflow_run_head_sha}"

    # CI SUCCESS
    if conclusion == "success":
        mark_commit_resolved(failure_id)

        return success("CI success processed")

    # IGNORE OTHER STATES
    if conclusion != "failure":
        return success("Ignored: not failure")

    is_new = acquire_processing_lock(
        failure_id,
        repository_full_name,
        workflow_run_id,
        workflow_run_head_sha,
        workflow_run_head_branch
    )

    if not is_new:
        return success("Duplicate webhook ignored")

    # Generate GitHub App token
    github_jwt_token = generate_github_app_jwt()
    installation_access_token = generate_github_installation_access_token(
        github_jwt_token, 
        installation_id
    )

    # Download CI logs
    destination_dir = download_ci_logs(
        repository_full_name,
        workflow_run_id, 
        installation_access_token
    )

    combined_logs = combine_ci_logs(destination_dir)

    failure_snippet = extract_failure_snippet(combined_logs)

    print("Detected CI failure:\n")
    print(failure_snippet)

    repo_files = get_repo_tree(
        repository_full_name, 
        workflow_run_head_sha, 
        installation_access_token
    )

    repo_tree = format_repo_tree(repo_files)

    prompt1 = build_file_selection_prompt(failure_snippet, repo_tree)
    llm_response1 = call_llm(prompt1)
    print("LLM response for file selection:", llm_response1)
    selected_files = parse_selected_files(llm_response1)

    print("selected_files", selected_files)

    # download those files
    repo_files_content = fetch_files(
        repository_full_name, 
        selected_files, 
        workflow_run_head_sha, 
        installation_access_token
    )

    print("repo_files_content",repo_files_content)

    # Task LLM to generate fix
    prompt2 = build_fix_prompt(failure_snippet, repo_files_content, workflow_run_head_sha)
    fix_response = call_llm(prompt2)

    print("Suggested Fix:", fix_response)

    fix = parse_llm_fix(fix_response)

    if fix is None:
        return success("Fix generation failed")

    update_failure_analysis(
        failure_id,
        failure_snippet,
        fix
    )

    return success("Failure analysis stored")

def success(message):
    return {
        "statusCode": 200,
        "body": json.dumps({"message": message})
    }
