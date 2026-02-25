require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { RekognitionClient, CreateFaceLivenessSessionCommand, GetFaceLivenessSessionResultsCommand } = require('@aws-sdk/client-rekognition');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Request Logger Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// AWS Rekognition Client
const rekognitionClient = new RekognitionClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

/**
 * 1. Create Face Liveness Session
 * Returns a sessionId to the mobile app
 */
app.post('/api/create-session', async (req, res, next) => {
    try {
        const command = new CreateFaceLivenessSessionCommand({});
        const response = await rekognitionClient.send(command);

        console.log('Session Created:', response.SessionId);
        res.status(200).json({ sessionId: response.SessionId });
    } catch (error) {
        next(error);
    }
});

/**
 * 2. Get Face Liveness Session Results
 * Validates the result using sessionId
 */
app.get('/api/get-session-results/:sessionId', async (req, res, next) => {
    const { sessionId } = req.params;

    if (!sessionId) {
        return res.status(400).json({ error: 'SessionId is required' });
    }

    try {
        const command = new GetFaceLivenessSessionResultsCommand({
            SessionId: sessionId
        });
        const response = await rekognitionClient.send(command);

        console.log('Session Results:', response.Status);

        // Return full results to the mobile app (POC level)
        res.status(200).json({
            status: response.Status,
            confidence: response.Confidence,
            referenceImage: response.ReferenceImage,
            auditImages: response.AuditImages
        });
    } catch (error) {
        next(error);
    }
});

/**
 * 3. Validate Liveness (Simplified endpoint)
 * Checks if Confidence is above a threshold (e.g., 90)
 */
app.post('/api/validate-liveness', async (req, res, next) => {
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: 'SessionId is required' });
    }

    try {
        const command = new GetFaceLivenessSessionResultsCommand({
            SessionId: sessionId
        });
        const response = await rekognitionClient.send(command);

        const isLive = response.Status === 'SUCCEEDED' && response.Confidence > 90;

        res.status(200).json({
            success: isLive,
            status: response.Status,
            confidence: response.Confidence,
            message: isLive ? 'Real person detected' : 'Liveness check failed'
        });
    } catch (error) {
        next(error);
    }
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'AWS Face Liveness Backend is running!',
        endpoints: [
            'POST /api/create-session',
            'GET /api/get-session-results/:sessionId',
            'POST /api/validate-liveness'
        ]
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('--- BACKEND ERROR ---');
    console.error(`Time: ${new Date().toISOString()}`);
    console.error(`Path: ${req.path}`);
    console.error(`Message: ${err.message}`);
    console.error('Stack Trace:', err.stack);
    console.error('----------------------');

    res.status(err.status || 500).json({
        error: 'Backend API Error',
        message: err.message,
        path: req.path,
        // Include stack in POC for debugging
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});
