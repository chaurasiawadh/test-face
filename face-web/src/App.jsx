import React, { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness';
import { ThemeProvider, Loader, View, Heading, Text } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

/**
 * Project: Face Web - AWS Face Liveness for React Native WebView
 * This app is designed to be hosted via HTTPS and opened in a mobile WebView.
 */

// --- CONFIGURATION ---
// IMPORTANT: You MUST set up a Cognito Identity Pool to give the browser 
// permissions to call Rekognition.
Amplify.configure({
  Auth: {
    Cognito: {
      // If you are using guest access (recommended for POC):
      identityPoolId: 'ap-south-1:fdc1aa9b-c965-4f22-9d6f-b9deb348f355', // REPLACE WITH YOUR IDENTITY POOL ID
      allowGuestAccess: true,
      region: 'ap-south-1'
    }
  },
  Rekognition: {
    region: 'ap-south-1'
  }
});

export default function App() {
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Get sessionId from URL query param (?sessionId=...)
    // 2. Fallback to the one provided in the prompt
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('sessionId') || '7c4aa9e1-37c6-45a8-80bf-3cef29ee7590';

    if (!id) {
      setError('No Session ID provided. Please pass ?sessionId=... in the URL.');
    } else {
      setSessionId(id);
    }
    setLoading(false);
  }, []);

  const handleAnalysisComplete = async () => {
    /**
     * Called when the liveness check is complete on the client side.
     * The results must still be verified by your backend using GetFaceLivenessSessionResults.
     */
    console.log('Analysis complete for session:', sessionId);

    // Communicate back to React Native WebView
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        status: 'success',
        sessionId: sessionId,
        message: 'Liveness analysis complete. Verifying results...'
      }));
    }
  };

  const handleError = (error) => {
    console.error('Liveness Error:', error);
    setError(error.message || 'An error occurred during liveness detection.');

    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        status: 'error',
        sessionId: sessionId,
        error: error.message
      }));
    }
  };

  if (loading) {
    return (
      <View textAlign="center" padding="5rem">
        <Loader size="large" />
        <Heading level={4} marginTop="1rem">Initializing Camera...</Heading>
      </View>
    );
  }

  if (error && !sessionId) {
    return (
      <View textAlign="center" padding="2rem" color="red">
        <Heading level={3}>Configuration Error</Heading>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <View className="liveness-container">
        <FaceLivenessDetector
          sessionId={sessionId}
          region="ap-south-1"
          onAnalysisComplete={handleAnalysisComplete}
          onError={handleError}
          onUserExit={() => {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'exit' }));
            }
          }}
        />
      </View>
    </ThemeProvider>
  );
}
