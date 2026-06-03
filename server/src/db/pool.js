const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: process.env.NODE_ENV === 'production' || process.env.PGHOST.includes('neon.tech') 
        ? { rejectUnauthorized: false } 
        : false,
});

module.exports = pool;