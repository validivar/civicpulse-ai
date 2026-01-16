# CivicPulse AI - API Documentation

## Base URL
Production: https://api.civicpulse.ai/v1
Development: https://dev-api.civicpulse.ai/v1
## Authentication
All API requests require authentication using JWT tokens:
Authorization: Bearer <jwt_token>
## Endpoints

### 1. Process Voice Input

**POST** `/process-voice`

Process voice recording and create a civic issue report.

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <jwt_token>"
}
```

**Request Body:**
```json
{
  "userId": "user_12345",
  "audio": "base64_encoded_audio_data",
  "transcript": "There's a large pothole on Princess Street" (optional)
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Issue reported successfully",
  "issueId": "ISSUE-20260116123045-user",
  "issueType": "Infrastructure - Pothole",
  "location": "Princess Street",
  "urgency": "medium",
  "status": "Pending",
  "estimatedResolution": "7 days"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "error": "Error message",
  "message": "Failed to process voice input"
}
```

---

### 2. List Issues

**GET** `/issues`

Retrieve a list of civic issues with optional filters.

**Query Parameters:**
- `status` (optional): Filter by status (Pending, In Progress, Resolved)
- `urgency` (optional): Filter by urgency (low, medium, high)
- `issueType` (optional): Filter by issue type
- `location` (optional): Filter by location
- `limit` (optional): Maximum number of results (default: 100)

**Example Request:**
GET /issues?status=Pending&urgency=high&limit=50
**Response (200 OK):**
```json
{
  "success": true,
  "count": 15,
  "issues": [
    {
      "IssueID": "ISSUE-20260116123045-user",
      "UserID": "user_12345",
      "Transcript": "Large pothole on Princess Street",
      "IssueType": "Infrastructure - Pothole",
      "Location": "Princess Street",
      "Sentiment": "NEGATIVE",
      "Urgency": "high",
      "Status": "Pending",
      "Timestamp": "2026-01-16T12:30:45Z",
      "Reports": 1
    }
  ]
}
```

---

### 3. Get Single Issue

**GET** `/issues/{issueId}`

Retrieve details for a specific issue.

**Path Parameters:**
- `issueId`: Issue identifier

**Response (200 OK):**
```json
{
  "success": true,
  "issue": {
    "IssueID": "ISSUE-20260116123045-user",
    "UserID": "user_12345",
    "Transcript": "Large pothole on Princess Street",
    "IssueType": "Infrastructure - Pothole",
    "Location": "Princess Street",
    "Sentiment": "NEGATIVE",
    "SentimentScores": {
      "Positive": 0.05,
      "Negative": 0.85,
      "Neutral": 0.08,
      "Mixed": 0.02
    },
    "Urgency": "high",
    "Status": "Pending",
    "Timestamp": "2026-01-16T12:30:45Z",
    "Reports": 1,
    "Entities": [...]
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Issue not found"
}
```

---

### 4. Update Issue

**PUT** `/issues/{issueId}`

Update an existing issue (typically status changes).

**Request Body:**
```json
{
  "Status": "In Progress",
  "Notes": "Work crew assigned",
  "AssignedTo": "crew_123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Issue updated successfully",
  "issue": {
    "IssueID": "ISSUE-20260116123045-user",
    "Status": "In Progress",
    "UpdatedAt": "2026-01-17T10:15:30Z",
    ...
  }
}
```

---

### 5. Delete Issue

**DELETE** `/issues/{issueId}`

Delete an issue (admin only).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

---

## Rate Limits

- **Standard Users:** 1,000 requests per hour
- **Premium Users:** 10,000 requests per hour
- **Admin Users:** Unlimited

**Rate Limit Headers:**
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1642348800
## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Webhooks (Coming Soon)

Subscribe to real-time issue updates:
```json
{
  "event": "issue.created",
  "timestamp": "2026-01-16T12:30:45Z",
  "data": {
    "issueId": "ISSUE-20260116123045-user",
    "status": "Pending"
  }
}
```

## SDK Examples

### JavaScript
```javascript
const civicpulse = require('@civicpulse/sdk');

const client = civicpulse.init({
  apiKey: 'your_api_key',
  environment: 'production'
});

// Report an issue
const issue = await client.issues.create({
  transcript: "Pothole on Princess Street",
  userId: "user_123"
});

console.log(issue.issueId);
```

### Python
```python
from civicpulse import CivicPulseClient

client = CivicPulseClient(api_key='your_api_key')

# List issues
issues = client.issues.list(status='Pending', urgency='high')

for issue in issues:
    print(f"{issue.id}: {issue.location}")
```