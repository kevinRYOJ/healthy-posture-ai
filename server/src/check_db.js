const pool = require('./db/pool');

async function check() {
    try {
        const res = await pool.query('SELECT email, has_personalized FROM users');
        console.log(res.rows);
    } catch(e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
check();
