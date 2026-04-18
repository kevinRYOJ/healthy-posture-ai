const express = require('express');
const pool = require('./config/db');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API jalan 🚀');
});

app.listen(3000, () => {
  console.log('Server running di port 3000');
});