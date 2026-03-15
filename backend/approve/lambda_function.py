import json
import base64
import hmac
import hashlib
import boto3
import os
import jwt
import time
import requests

WEBHOOK_SECRET = os.environ["GITHUB_WEBHOOK_SECRET"]
GITHUB_APP_ID = os.environ["GITHUB_APP_ID"]
GITHUB_PRIVATE_KEY = os.environ["GITHUB_PRIVATE_KEY"]

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("ci_failures")

# ── CORS ─────────────────────────────────────────────────────────────────────

HEADERS = {
    "Content-Type"                 : "application/json",
    "Access-Control-Allow-Origin"  : "*",
    "Access-Control-Allow-Methods" : "GET, POST, OPTIONS"
}

def cors_response(status_code, body):
    return {
    "statusCode": 200,
    "headers": HEADERS,
    "body": json.dumps(body)
    }

# ─────────────────────────────────────────────────────────────────────────────

def verify_signature(payload_body, signature_header):

    if not signature_header:
        return False

    mac = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload_body.encode(),
        hashlib.sha256
    )

    expected_signature = "sha256=" + mac.hexdigest()

    return hmac.compare_digest(expected_signature, signature_header)


def generate_github_app_jwt():

    now = int(time.time())

    payload = {
        "iat": now,
        "exp": now + 600,
        "iss": GITHUB_APP_ID
    }

    encoded_jwt = jwt.encode(
        payload,
        GITHUB_PRIVATE_KEY,
        algorithm="RS256"
    )

    if isinstance(encoded_jwt, bytes):
        encoded_jwt = encoded_jwt.decode("utf-8")

    return encoded_jwt

def github_request(method, url, headers, payload=None):

    if method == "GET":
        response = requests.get(url, headers=headers)

    elif method == "POST":
        response = requests.post(url, headers=headers, json=payload)

    elif method == "PUT":
        response = requests.put(url, headers=headers, json=payload)

    else:
        raise Exception("Unsupported HTTP method")

    if response.status_code >= 400:
        raise Exception(
            f"GitHub API error {response.status_code}: {response.text}"
        )

    return response.json()

def generate_installation_token(api_url, jwt_token):

    headers = {
        "Authorization": f"Bearer {jwt_token}",
        "Accept": "application/vnd.github+json"
    }

    response = requests.post(api_url, headers=headers)

    if response.status_code != 201:
        raise Exception(
            f"Failed to generate installation token: {response.text}"
        )

    return response.json()["token"]

def get_branch_sha(user, repo, branch, token):

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json"
    }


    url = f"https://api.github.com/repos/{user}/{repo}/git/ref/heads/{branch}"

    data = github_request("GET", url, headers)

    return data["object"]["sha"]

def create_branch(user, repo, sha, branch, token):

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json"
    }

    payload = {
        "ref": f"refs/heads/{branch}",
        "sha": sha
    }

    url = f"https://api.github.com/repos/{user}/{repo}/git/refs"

    try:
        github_request("POST", url, headers, payload)
        print("Branch created")

    except Exception as e:
        if "Reference already exists" in str(e):
            print("Branch already exists")
        else:
            raise e

def get_file_sha(user, repo, file_path, branch, token):

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json"
    }

    url = f"https://api.github.com/repos/{user}/{repo}/contents/{file_path}?ref={branch}"

    data = github_request("GET", url, headers)

    return data["sha"]

def update_file(user, repo, file_path, new_content, sha, branch, token):

    encoded_content = base64.b64encode(new_content.encode()).decode()

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json"
    }

    payload = {
        "message": f"AI fix for {file_path}",
        "content": encoded_content,
        "sha": sha,
        "branch": branch
    }

    url = f"https://api.github.com/repos/{user}/{repo}/contents/{file_path}"

    github_request("PUT", url, headers, payload)

    print(f"{file_path} updated")

def create_pull_request(user, repo, branch, new_branch, token):

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json"
    }

    payload = {
        "title": "AI fix for CI error",
        "body": "Automatically fixing missing dependency detected by CI.",
        "head": new_branch,
        "base": branch
    }

    url = f"https://api.github.com/repos/{user}/{repo}/pulls"

    data = github_request("POST", url, headers, payload)

    print("PR created:")

def convert_format_modified_files(data):
    
    files = []

    for item in data:
        files.append({
            "file": item["file"],
            "content": item["new_content"]
        })
    print(files)
    
    return files

def lambda_handler(event, context):
    event = json.loads(event["body"])
    failure_id = event["failure_id"]
    print("failure_id",failure_id)
    
    if event["action"] == "deny":
        table.update_item(
            Key={
                "failure_id" : failure_id
            },
            UpdateExpression="SET #s = :val",
            ExpressionAttributeNames={
                "#s": "status"
            },
            ExpressionAttributeValues={
                ":val": "action_denied"
            }
        )

        return cors_response(200, "Skipping because action is denied by the user")

    response = table.get_item(
        Key={
            "failure_id": failure_id
        }
    )

    item = response.get("Item")

    user = item['repo_name'].split("/")

    gh_user = user[0]
    repo = user[1]
    branch = item['branch']
    new_branch = item['branch_name']
    files = convert_format_modified_files(item['files_to_modify'])
    status = item['status']

    if status != 'pending_approval':
        return cors_response(400, "Skipping because status is not pending_approval")

    try:

        # Generate GitHub App JWT
        jwt_token = generate_github_app_jwt()

        headers = {
            "Authorization": f"Bearer {jwt_token}",
            "Accept": "application/vnd.github+json"
        }

        installation_url = f"https://api.github.com/repos/{gh_user}/{repo}/installation"

        data = github_request("GET", installation_url, headers)

        installation_api = data["access_tokens_url"]

        # Get installation access token
        access_token = generate_installation_token(
            installation_api,
            jwt_token
        )

        # Get branch SHA
        sha = get_branch_sha(
            gh_user,
            repo,
            branch,
            access_token
        )

        # Create fix branch
        create_branch(
            gh_user,
            repo,
            sha,
            new_branch,
            access_token
        )


        for file in files:
          file_sha = get_file_sha(
           gh_user,
           repo,
           file["file"],
           new_branch,
           access_token
          )

          update_file(
            gh_user,
            repo,
            file["file"],
            file["content"],
            file_sha,
            new_branch,
            access_token
          )

        # Create PR
        create_pull_request(
            gh_user,
            repo,
            branch,
            new_branch,
            access_token
        )


        table.update_item(
            Key={
                "failure_id" : failure_id
            },
            UpdateExpression="SET #s = :val",
            ExpressionAttributeNames={
                "#s": "status"
            },
            ExpressionAttributeValues={
                ":val": "approved"
            }
        )
        
        return cors_response(200, json.dumps("Fix branch created and PR opened"))

    except Exception as e:

        print("ERROR:", str(e))

        return cors_response(500, json.dumps(str(e)))
