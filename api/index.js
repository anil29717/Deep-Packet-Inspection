require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Route imports
const flowRoutes = require('./src/routes/flowRoutes');
const statsRoutes = require('./src/routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000 // Increased from 100 to support Dashboard 5-second polling
});
app.use('/api/', apiLimiter);

// Routes
const authRoutes = require('./src/routes/authRoutes');
const employeeRoutes = require('./src/routes/employeeRoutes');
const deepPacketRoutes = require('./src/routes/deepPacketRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/flows', flowRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/deep-packets', deepPacketRoutes);

// Start Cron Jobs
require('./src/jobs/dailyAggregation');

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const http = require('http');
const { WebSocketServer } = require('ws');
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket is open' }));

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Broadcast helper for real-time notifications
app.set('wss', wss);

server.listen(PORT, () => {
    console.log(`DPI API running on port ${PORT}`);
});
