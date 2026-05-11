const pool = require('../config/db');

exports.startSession = async (req, res) => {
    try {
        const { rows } = await pool.query(
            'INSERT INTO sitting_sessions (user_id, start_time) VALUES ($1, NOW()) RETURNING *',
            [req.userId]
        );
        res.status(201).json({ session: rows[0] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.stopSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(
            `UPDATE sitting_sessions
       SET end_time = NOW(),
           duration = EXTRACT(EPOCH FROM (NOW() - start_time))::INTEGER
       WHERE id=$1 AND user_id=$2 RETURNING *`,
            [id, req.userId]
        );
        if (!rows.length) return res.status(404).json({ message: 'Sesi tidak ditemukan' });
        res.json({ session: rows[0] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.recordBreak = async (req, res) => {
    try {
        const { sitting_session_id, duration } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO break_sessions (sitting_session_id, user_id, break_time, duration) VALUES ($1,$2,NOW(),$3) RETURNING *',
            [sitting_session_id, req.userId, duration]
        );
        res.status(201).json({ break: rows[0] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getSessions = async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM sitting_sessions WHERE user_id=$1 ORDER BY start_time DESC',
            [req.userId]
        );
        res.json({ sessions: rows });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};