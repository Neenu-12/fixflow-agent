# 🤖 AI-Powered CI Failure Remediation

An intelligent system that automatically detects GitHub Actions CI failures, analyzes root causes using the Nova AI model, proposes code fixes, and applies them via pull requests — all with human-in-the-loop approval.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [API Endpoints](#api-endpoints)
- [Data Model](#data-model)
- [Risk Scoring](#risk-scoring)
- [Nova Model Integration](#nova-model-integration)
- [How It Works](#how-it-works)
- [Frontend Pages](#frontend-pages)
- [Security](#security)
- [Example Scenario](#example-scenario)

---

## Overview

When a CI pipeline fails on GitHub, this system:

1. Captures the failure via a GitHub App webhook
2. Fetches and analyzes CI logs
3. Calls the **Nova AI model** to identify the root cause and propose a fix
4. Computes a **risk score** for the proposed change
5. Displays everything on a **dashboard** for developer review
6. On approval, **automatically creates a branch, applies the patch, and opens a PR**
7. Reruns CI and tracks the result

---

## Architecture

```
GitHub → Webhook → Backend → Nova Model → DynamoDB → Dashboard → Approval → PR → CI Rerun
```

### Full Flow Diagram

```
┌────────────────────┐
│    Developer       │
│  Pushes Commit     │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ GitHub Actions CI  │
│     Workflow       │
└─────────┬──────────┘
          │ (Failure Event)
          ▼
┌────────────────────┐
│  GitHub App        │
│  Webhook Trigger   │
└─────────┬──────────┘
          │
          ▼
┌────────────────────────────┐
│  API Gateway (HTTP API)    │
└─────────┬──────────────────┘
          │
          ▼
┌────────────────────────────┐
│  Webhook Lambda            │
│  - Validate signature      │
│  - Generate token          │
│  - Fetch CI logs           │
│  - Extract failure         │
│  - Call Nova model         │
│  - Generate patch proposal │
│  - Compute risk score      │
│  - Store in DynamoDB       │
└─────────┬──────────────────┘
          │
          ▼
┌────────────────────────────┐
│      DynamoDB              │
│  Table: ci_failures        │
│  status = pending          │
└─────────┬──────────────────┘
          │
          ▼
┌────────────────────────────┐
│  Frontend Dashboard        │
│  - Show failure            │
│  - Show root cause         │
│  - Show diff preview       │
│  - Show risk level         │
│  - Approve / Reject        │
└─────────┬──────────────────┘
          │ (User Approval)
          ▼
┌────────────────────────────┐
│  Approval Lambda           │
│  - Create branch           │
│  - Apply patch             │
│  - Commit changes          │
│  - Create PR               │
│  - Update DynamoDB         │
└─────────┬──────────────────┘
          │
          ▼
┌────────────────────────────┐
│  GitHub PR + CI Rerun      │
└─────────┬──────────────────┘
          │ (CI Result)
          ▼
┌────────────────────────────┐
│  Status Update Lambda      │
│  - Capture PR CI result    │
│  - Update DynamoDB status  │
└────────────────────────────┘
```

---

## Features

- 🔍 **Automatic failure detection** via GitHub App webhooks
- 🧠 **AI-powered root cause analysis** using the Nova model
- 🩹 **Minimal patch proposals** targeting only the affected files
- 📊 **Risk scoring** before any change is applied
- 👁️ **Diff preview** so developers know exactly what will change
- ✅ **Human-in-the-loop approval** — nothing is merged without consent
- 🔁 **Closed-loop CI rerun** with automated status tracking
- 🔐 **GitHub OAuth login** and webhook signature verification

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React / Next.js                     |
| Auth      | GitHub OAuth                        |
| Backend   | AWS Lambda (Python/Node)            |
| API       | AWS API Gateway (HTTP API)          |
| Database  | AWS DynamoDB                        |
| AI Model  | Amazon Nova                         |
| CI/CD     | GitHub Actions                      |
| GitHub    | GitHub App (Webhooks + Installation Tokens) |

---

## API Endpoints

| Method | Endpoint              | Description                                      |
|--------|-----------------------|--------------------------------------------------|
| `POST` | `/github/webhook`     | Receives CI failure events from GitHub           |
| `POST` | `/approve`            | Triggers branch creation, patch apply, and PR    |
| `GET`  | `/failures`           | Returns failure list for the frontend dashboard  |

### Query Parameters for `GET /failures`

| Parameter | Values                           | Description               |
|-----------|----------------------------------|---------------------------|
| `status`  | `pending`, `approved`, `resolved`| Filter failures by status |

---

## Data Model

**DynamoDB Table:** `ci_failures`

| Attribute        | Type   | Description                                    |
|------------------|--------|------------------------------------------------|
| `failure_id`     | String | Partition Key                                  |
| `repo_name`      | String | GitHub repository name                         |
| `branch`         | String | Branch where failure occurred                  |
| `commit_sha`     | String | Commit hash that triggered CI                  |
| `root_cause`     | String | AI-generated root cause explanation            |
| `proposed_patch` | JSON   | Structured patch proposal from Nova            |
| `risk_score`     | String | `low`, `medium`, or `high`                     |
| `confidence`     | Float  | Nova model confidence score (0–1)              |
| `status`         | String | `pending` / `approved` / `merged` / `failed`  |
| `pr_url`         | String | URL of the created pull request                |
| `timestamp`      | String | ISO timestamp of when failure was recorded     |

---

## Risk Scoring

Risk is computed before any approval is requested:

| Level          | Conditions                                  |
|----------------|---------------------------------------------|
| 🟢 **Low**     | < 10 lines changed, only source file touched |
| 🟡 **Medium**  | Dependency file changed (e.g. `requirements.txt`) |
| 🔴 **High**    | Workflow file modified (e.g. `.github/workflows/`) |

Risk level is displayed prominently in the UI before the user approves.

---

## Nova Model Integration

The Nova model is used for structured multi-step reasoning inside the Webhook Lambda:

**Steps:**
1. Analyze failure logs
2. Identify root cause
3. Identify affected file(s)
4. Propose a minimal modification

**Expected output format:**

```json
{
  "root_cause": "The module pandas is imported but not listed in requirements.txt.",
  "files_to_modify": [
    {
      "file_path": "requirements.txt",
      "original": "",
      "replacement": "pandas==2.2.1"
    }
  ],
  "confidence": 0.91
}
```

> **Pre-processing before LLM:** Rather than sending entire CI logs, the Webhook Lambda extracts the relevant failure block (e.g. 40 lines around the traceback) to reduce token usage and improve accuracy.

---

## How It Works

### Agentic Reasoning Flow (Webhook Lambda)

1. Receive CI failure event from GitHub
2. Fetch workflow run logs via GitHub API
3. Extract relevant failure block (traceback + error)
4. Send structured prompt to Nova with error message, log snippet, and relevant file content
5. Receive structured JSON response with `root_cause`, `files_to_modify`, and `confidence`
6. Validate: does the file exist? Are the changes minimal?
7. Compute risk score
8. Store proposal in DynamoDB with `status = pending_approval`

### Frontend Polling

The frontend polls for new failures every 10–15 seconds:

```
GET /failures?status=pending
```

---

## Frontend Pages

| Page                  | Description                                         |
|-----------------------|-----------------------------------------------------|
| **Pending Fixes**     | Lists all CI failures awaiting approval             |
| **Failure Detail**    | Shows root cause, diff preview, risk badge          |
| **Active PRs**        | Shows approved fixes with open PRs in progress      |
| **Resolved History**  | Shows completed and merged fixes                    |

### UI Components

- Failure list with status badges
- Diff viewer (before/after patch)
- Risk badge (🟢 / 🟡 / 🔴)
- Approve / Reject buttons
- PR status view
- GitHub OAuth login

---

## Security

| Concern              | Approach                                                   |
|----------------------|------------------------------------------------------------|
| Webhook authenticity | Verify GitHub webhook signature (`X-Hub-Signature-256`)    |
| GitHub API access    | Use short-lived **App Installation Tokens**                |
| User authorization   | Approval endpoint requires authenticated GitHub user       |
| Branch safety        | All patches applied to a new branch — never directly to `main` |

---

## Example Scenario

**Situation:** A developer pushes code that imports `pandas`, but `pandas` is not in `requirements.txt`.

**CI Failure:**
```
ModuleNotFoundError: No module named 'pandas'
```

**System Response:**

| Step | Actor | Action |
|------|-------|--------|
| 1 | Developer | Pushes commit to GitHub |
| 2 | GitHub Actions | CI workflow runs and fails |
| 3 | GitHub App | Sends webhook to API Gateway |
| 4 | API Gateway | Routes to Webhook Lambda |
| 5 | Webhook Lambda | Verifies signature, fetches logs |
| 6 | Webhook Lambda | Extracts failure block (pre-processing) |
| 7 | Nova Model | Identifies root cause, proposes patch |
| 8 | Webhook Lambda | Computes risk: 🟡 Medium (dependency file) |
| 9 | DynamoDB | Stores proposal with `status = pending` |
| 10 | Frontend | Polls and displays the pending fix |
| 11 | Developer | Reviews diff, clicks **Approve** |
| 12 | Approval Lambda | Creates branch `ai-fix/run-12345`, applies patch, opens PR |
| 13 | GitHub Actions | Reruns CI on the new PR branch |
| 14 | CI Passes | Webhook Lambda updates status to `resolved` |

**Nova Proposal:**
```json
{
  "root_cause": "The module pandas is imported but not listed in requirements.txt.",
  "files_to_modify": [
    {
      "file_path": "requirements.txt",
      "original": "",
      "replacement": ""
    }
  ],
  "confidence": 0.91
}
```

**PR commit message:**
```
fix(ci): add missing pandas dependency
```

---

> Built with ❤️ using AWS Lambda, DynamoDB, Amazon Nova, and GitHub Apps.