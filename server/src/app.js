const express = require('express');
const cors = require('cors');

const app = express();

const users = require('./api/users');
const authentications = require('./api/authentications');
const auth = require('./middlewares/auth');
const sessions = require('./api/sessions');

app.use(cors({
    origin: 'http://localhost:3000',
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
app.get('/api/auth/me', auth, (req, res) => {
    return res.json({
        status: 'success',
        data: {
            user: req.user,
        },
    });
});

app.use('/api/sessions', sessions());

module.exports = app;