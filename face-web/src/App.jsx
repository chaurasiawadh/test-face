import React, { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness';
import { ThemeProvider, Loader, View, Heading, Text } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

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
  const [isLivenessSuccessful, setIsLivenessSuccessful] = useState(false);

  useEffect(() => {
    // 1. Get sessionId from URL query param (?sessionId=...)
    // 2. Fallback to the one provided in the prompt
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('sessionId') || 'c3c9f8b4-f105-445e-b0af-3d3e51bccf3d';

    if (!id) {
      setError('No Session ID provided. Please pass ?sessionId=... in the URL.');
    } else {
      setSessionId(id);
    }
    setLoading(false);
  }, []);

  const handleAnalysisComplete = async (data) => {
    console.log('data>>>', data);

    /**
     * Called when the liveness check is complete on the client side.
     * The results must still be verified by your backend using GetFaceLivenessSessionResults.
     */
    console.log('Analysis complete for session:', sessionId);

    // Provide a small artificial delay to simulate the backend validation via GetFaceLivenessSessionResults.
    // This prevents the race condition where `onAnalysisComplete` resolves instantly and gets the UI stuck on "Verifying...".
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Show the success UI with the mock confidence score
    setIsLivenessSuccessful(true);

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
    console.error('Liveness Error Web:', error);
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

  if (isLivenessSuccessful) {
    return (
      <ThemeProvider>
        <View textAlign="center" padding="4rem" style={{ backgroundColor: '#fff', height: '100vh' }}>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '2rem', padding: '0.75rem 1.5rem', backgroundColor: '#007eb9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Backend API Call
          </button>
        </View>
      </ThemeProvider>
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
