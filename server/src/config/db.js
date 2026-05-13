const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.connect()
    .then(() => {
        console.log('✅ Database connected');
    })
    .catch((error) => {
        console.error('❌ Database error:', error.message);
    });

module.exports = pool;