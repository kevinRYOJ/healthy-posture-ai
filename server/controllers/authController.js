const pool    = require('../config/db');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
require('dotenv').config();

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password minimal 6 karakter' });

    const exist = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (exist.rows.length)
      return res.status(409).json({ message: 'Email sudah terdaftar' });

    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING id,name,email,created_at',
      [name, email, hashed]
    );
    res.status(201).json({ token: createToken(rows[0].id), user: rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (!rows.length)
      return res.status(401).json({ message: 'Email atau password salah' });

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match)
      return res.status(401).json({ message: 'Email atau password salah' });

    const { password: _, ...user } = rows[0];
    res.json({ token: createToken(user.id), user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id,name,email,created_at FROM users WHERE id=$1',
      [req.userId]
    );
    if (!rows.length) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json({ user: rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const { rows } = await pool.query(
      'UPDATE users SET name=$1 WHERE id=$2 RETURNING id,name,email,created_at',
      [name, req.userId]
    );
    res.json({ user: rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};