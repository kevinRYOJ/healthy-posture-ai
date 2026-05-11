require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Import db supaya koneksi langsung dicek saat server start
require('./config/db');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/health-score', require('./routes/healthScore'));

app.post('/predict', (req, res) => {
  const { total_sitting } = req.body;
  let risk = 'Low';
  if (total_sitting > 480) risk = 'High';
  else if (total_sitting > 240) risk = 'Medium';
  res.json({ risk });
});

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);