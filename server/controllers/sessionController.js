const pool = require('../config/db');

function mapSession(row) {
    return {
        id: row.id,
        user_id: row.user_id,
        start: row.start_time,
        end: row.end_time,
        duration: Number(row.duration || 0),
        totalBreakTime: Number(row.total_break_time || 0),
        breaksTaken: Number(row.breaks_taken || 0),
    };
}

exports.createSession = async (req, res) => {
    try {
        const userId = req.user?.id || req.userId || req.user_id;

        if (!userId) {
            return res.status(401).json({
                message: 'User belum terautentikasi',
            });
        }

        const {
            startTime,
            endTime,
            duration,
            breaksTaken = 0,
            totalBreakTime = 0,
        } = req.body;

        console.log('BODY SESSION:', req.body);
        console.log('USER ID:', userId);

        if (!startTime) {
            return res.status(400).json({ message: 'startTime wajib diisi' });
        }

        if (!endTime) {
            return res.status(400).json({ message: 'endTime wajib diisi' });
        }

        const result = await pool.query(
            `
      INSERT INTO sitting_sessions
      (user_id, start_time, end_time, duration, total_break_time, breaks_taken)
      VALUES
      ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
            [
                userId,
                startTime,
                endTime,
                duration || 0,
                totalBreakTime || 0,
                breaksTaken || 0,
            ]
        );

        res.status(201).json({
            message: 'Session berhasil disimpan',
            session: result.rows[0],
        });
    } catch (error) {
        console.error('Create session error:', error);

        res.status(500).json({
            message: 'Gagal menyimpan session',
            error: error.message,
        });
    }
};

exports.getSessions = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT id, user_id, start_time, end_time, duration, total_break_time, breaks_taken
       FROM sitting_sessions
       WHERE user_id = $1
       ORDER BY start_time DESC`,
            [req.userId]
        );

        res.json({ sessions: rows.map(mapSession) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteAllSessions = async (req, res) => {
    try {
        await pool.query('DELETE FROM sitting_sessions WHERE user_id = $1', [req.userId]);
        res.json({ message: 'Semua session berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Endpoint lama tetap disediakan supaya tidak merusak kode lain.
exports.startSession = async (req, res) => {
    try {
        const { rows } = await pool.query(
            'INSERT INTO sitting_sessions (user_id, start_time) VALUES ($1, NOW()) RETURNING *',
            [req.userId]
        );
        res.status(201).json({ session: mapSession(rows[0]) });
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
        res.json({ session: mapSession(rows[0]) });
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
