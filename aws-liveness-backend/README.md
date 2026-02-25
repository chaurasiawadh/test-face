# AWS Face Liveness Backend (POC)

This is a clean and minimal Node.js + Express backend designed for development purposes to support AWS Face Liveness integration in a React Native app.

## Folder Structure
```text
aws-liveness-backend/
├── public/
│   └── liveness.html    # Static HTML for WebView
├── .env                 # Environment variables (AWS Credentials)
├── .env.example         # Template for environment variables
├── index.js             # Main Express server & AWS Logic
├── package.json         # Dependencies
└── README.md            # Documentation
```

## Setup Instructions

### 1. Requirements
- Node.js installed
- AWS Account with Rekognition Face Liveness access

### 2. IAM Permissions
Ensure the IAM User/Role associated with the credentials has the following permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "rekognition:CreateFaceLivenessSession",
                "rekognition:GetFaceLivenessSessionResults"
            ],
            "Resource": "*"
        }
    ]
}
```

### 3. AWS Credentials
Fill in your credentials in the `.env` file:
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```
*Note: Face Liveness is only available in specific regions (e.g., us-east-1, us-west-2, eu-west-1, ap-northeast-1, ap-southeast-2).*

### 4. How to Run Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   node index.js
   ```
The backend will run at `http://localhost:3000`.

## API Endpoints

### 1. Create Session
- **Endpoint**: `POST /api/create-session`
- **Description**: Creates a new Rekognition Face Liveness session.
- **Response**: `{ "sessionId": "..." }`

### 2. Get Results
- **Endpoint**: `GET /api/get-session-results/:sessionId`
- **Description**: Retrieves technical results of a completed session.

### 3. Validate Liveness
- **Endpoint**: `POST /api/validate-liveness`
- **Body**: `{ "sessionId": "..." }`
- **Description**: A simplified validation endpoint that returns `success: true` if the status is `SUCCEEDED` and confidence is > 90.

## Testing with ngrok (For HTTPS)
React Native and AWS Face Liveness often require HTTPS. Use **ngrok** to expose your local server:

1. Install ngrok (if not already): `npm install -g ngrok`
2. Run ngrok on port 3000:
   ```bash
   ngrok http 3000
   ```
3. Copy the `https://xxxx.ngrok-free.app` URL. Use this URL in your mobile app to point to your backend.

## Static WebView File
The backend serves a static file at:
`http://localhost:3000/liveness.html?sessionId=YOUR_SESSION_ID`

You can use this URL in your React Native `WebView` to test the integration.
