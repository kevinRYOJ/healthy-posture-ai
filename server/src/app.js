const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const app = express();

const users = require('./api/users');
const authentications = require('./api/authentications');
const auth = require('./middlewares/auth');
const sessions = require('./api/sessions');

const allowedOrigins = [
    'http://localhost:3000',
    'https://www.healthy-posture.my.id/',
    ...(process.env.CORS_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean),
];

console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn('CORS blocked origin:', origin);
            callback(null, false);
        }
    },
    credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Healthy Posture API Running',
    });
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'success',
    });
});

// Register
app.use('/api/auth/register', users());

// Login
app.use('/api/auth/login', authentications());

// Profile
const UsersService = require('./services/postgres/UsersService');
const usersService = new UsersService();

app.get('/api/auth/me', auth, async (req, res) => {
    try {

        const user = await usersService.getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User tidak ditemukan',
            });
        }

        return res.json({
            status: 'success',
            data: { user },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
});

app.put('/api/auth/profile', auth, async (req, res) => {

    try {
        const { age, bmi, sleep_hours, gender, work_type, fitness_level, device_preference } = req.body;
        await usersService.updatePersonalization(req.user.id, {
            age, bmi, sleep_hours, gender, work_type, fitness_level, device_preference
        });
        return res.status(200).json({ status: 'success', message: 'Profil berhasil diperbarui' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

app.use('/api/sessions', sessions());


// ══════════════════════════════════════════════════════════════
// Machine Learning Predict via Persistent Python Worker
// ══════════════════════════════════════════════════════════════

let mlMetadata = null;
try {
    const metadataPath = path.join(__dirname, 'api', 'sessions', 'model_metadata.json');
    mlMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    console.log('✅ ML Metadata loaded');
} catch (err) {
    console.error('Failed to load ML Metadata:', err.message);
}

// Auto-detect: venv di Windows → PYTHON_PATH env → python3 (Docker/Linux)
const venvPython = path.join(__dirname, '../../venv/Scripts/python.exe');
const pythonPath = fs.existsSync(venvPython) ? venvPython : (process.env.PYTHON_PATH || 'python3');
const scriptPath = path.join(__dirname, '../model_server.py');

const pythonProcess = spawn(pythonPath, [scriptPath], {
    stdio: ['ignore', 'pipe', 'pipe']
});

pythonProcess.stdout.on('data', (data) => console.log(`[Python] ${data.toString().trim()}`));
pythonProcess.stderr.on('data', (data) => console.error(`[Python Log] ${data.toString().trim()}`));
pythonProcess.on('close', (code) => console.log(`[Python] Server exited with code ${code}`));

process.on('exit', () => pythonProcess.kill());
process.on('SIGINT', () => { pythonProcess.kill(); process.exit(); });
process.on('SIGTERM', () => { pythonProcess.kill(); process.exit(); });

app.post('/predict', auth, async (req, res) => {
    try {
        const user = await usersService.getUserById(req.user.id);
        if (!user.has_personalized) return res.status(400).json({ status: 'fail', message: 'Please complete personalization first' });

        let { total_sitting = 0, number_of_breaks = 0, avg_break_duration = 0, longest_sitting_streak = 0, fatigue_level = 0, day_of_week, time_of_day } = req.body;
        if (!longest_sitting_streak) longest_sitting_streak = total_sitting;

        const now = new Date();
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const actualDay = day_of_week || dayNames[now.getDay()];
        const hour = now.getHours();
        const actualTime = time_of_day || (hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : hour < 21 ? 'Evening' : 'Night');

        // Data input mentah — Python yang akan encode & scale menggunakan pkl asli
        const inputData = {
            total_sitting_minutes: total_sitting,
            number_of_breaks,
            avg_break_duration_minutes: avg_break_duration,
            longest_sitting_streak_minutes: longest_sitting_streak,
            fatigue_level,
            age: user.age || 25,
            daily_work_hours: 8,
            bmi: parseFloat(user.bmi) || 22,
            sleep_hours: parseFloat(user.sleep_hours) || 7,
            gender: user.gender || 'Male',
            work_type: user.work_type || 'Office',
            fitness_level: user.fitness_level || 'Medium',
            day_of_week: actualDay,
            time_of_day_dominant: actualTime,
            device_preference: user.device_preference || 'Laptop'
        };

        const contextData = {
            name: user.name || 'User',
            age: user.age,
            work_type: user.work_type,
            total_sitting_minutes: total_sitting,
            number_of_breaks: number_of_breaks
        };

        const payload = JSON.stringify({ input: inputData, context: contextData });
        const pyReq = http.request({ hostname: '127.0.0.1', port: 5001, path: '/predict', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } }, (pyRes) => {
            let data = ''; pyRes.on('data', (chunk) => data += chunk);
            pyRes.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.error) throw new Error(result.error);
                    console.log(`🤖 Predict: ${result.pred_label} (${(result.confidence * 100).toFixed(1)}%) | sitting=${total_sitting}min`);
                    res.json({ status: 'success', data: { risk_level: result.pred_label, confidence: result.confidence, insight: result.insight } });
                } catch (e) { res.status(500).json({ status: 'error', message: 'Invalid response from Python model' }); }
            });
        });

        pyReq.on('error', (e) => {
            console.error('Failed to communicate with Python model:', e);
            res.status(500).json({ status: 'error', message: 'Python model server unavailable' });
        });
        pyReq.write(payload);
        pyReq.end();

    } catch (err) {
        console.error('Prediction error:', err);
        return res.status(500).json({ status: 'error', message: 'Internal server error during prediction' });
    }
});


// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
});

module.exports = app;