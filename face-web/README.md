# Face Liveness Web (Vite + React)

This project provides a standalone web interface for AWS Face Liveness. It is designed to be hosted via HTTPS and embedded in a React Native WebView.

## 🚀 Quick Start

### 1. Project Creation (Already Done)
```bash
npx create-vite@latest face-web --template react
cd face-web
npm install
npm install aws-amplify @aws-amplify/ui-react @aws-amplify/ui-react-liveness
```

### 2. AWS Setup (CRITICAL)
For the browser to access AWS Rekognition, you must configure a Cognito Identity Pool:

1.  **Create Identity Pool**: Go to AWS Cognito Console -> Identity Pools -> Create new.
2.  **Enable Guest Access**: Check "Enable access to unauthenticated identities".
3.  **Permissions**: Assign an IAM role to the unauthenticated identities with this policy:
    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": "rekognition:StartFaceLivenessSession",
                "Resource": "*"
            }
        ]
    }
    ```
4.  **Update `App.jsx`**: Replace `identityPoolId` with your new ID (e.g., `us-east-1:xxx-xxx-xxx`).

### 3. Run Locally
```bash
npm run dev
```
Open: `http://localhost:5173/?sessionId=7c4aa9e1-37c6-45a8-80bf-3cef29ee7590`

### 4. Build for Production
```bash
npm run build
```
The output will be in the `dist/` folder. This folder must be hosted on an **HTTPS** server because camera access is restricted on non-secure origins.

## 📱 React Native Integration
In your React Native app, use `react-native-webview`:

```javascript
<WebView
  source={{ uri: 'https://your-hosted-liveness-web.com/?sessionId=' + sessionId }}
  allowsInlineMediaPlayback={true}
  mediaPlaybackRequiresUserAction={false}
  onMessage={(event) => {
    const data = JSON.parse(event.nativeEvent.data);
    console.log('Liveness Event:', data);
  }}
/>
```

## 🛠 Features Included
*   **Dynamic Session ID**: Pass `?sessionId=...` in the URL.
*   **Amplify UI Integration**: Uses the official `FaceLivenessDetector`.
*   **WebView Communication**: Uses `window.ReactNativeWebView.postMessage` to notify the mobile app on completion or error.
*   **Vite Optimized**: Fast builds and small footprint.
