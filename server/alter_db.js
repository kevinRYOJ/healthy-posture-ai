require('dotenv').config();
const pool = require('./src/db/pool');

async function run() {
    try {
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS has_personalized BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS age INTEGER,
            ADD COLUMN IF NOT EXISTS bmi NUMERIC,
            ADD COLUMN IF NOT EXISTS sleep_hours NUMERIC,
            ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
            ADD COLUMN IF NOT EXISTS work_type VARCHAR(50),
            ADD COLUMN IF NOT EXISTS fitness_level VARCHAR(20),
            ADD COLUMN IF NOT EXISTS device_preference VARCHAR(50);
        `);
        console.log("Columns added successfully");
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
run();
