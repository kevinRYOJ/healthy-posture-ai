const pool = require('../config/db');

exports.getScore = async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM health_score WHERE user_id=$1 AND date=CURRENT_DATE',
            [req.userId]
        );
        res.json({ score: rows[0] || null });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.saveScore = async (req, res) => {
    try {
        const { score } = req.body;
        const { rows } = await pool.query(
            `INSERT INTO health_score (user_id, score, date) VALUES ($1,$2,CURRENT_DATE)
       ON CONFLICT (user_id, date) DO UPDATE SET score=$2 RETURNING *`,
            [req.userId, score]
        );
        res.json({ score: rows[0] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};