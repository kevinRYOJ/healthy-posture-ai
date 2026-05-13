const { Pool } = require('pg');
const { nanoid } = require('nanoid');

require('dotenv').config();

class UsersService {
    constructor() {
        this._pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });
    }

    async addUser({ name, email, password }) {
        const id = `user-${nanoid(16)}`;

        const query = {
            text: `
        INSERT INTO users(id, name, email, password)
        VALUES($1, $2, $3, $4)
        RETURNING id, name, email
      `,
            values: [id, name, email, password],
        };

        const result = await this._pool.query(query);

        return result.rows[0];
    }

    async getUserByEmail(email) {
        const query = {
            text: `
        SELECT *
        FROM users
        WHERE email = $1
      `,
            values: [email],
        };

        const result = await this._pool.query(query);

        return result.rows[0];
    }

    async getUserById(id) {
        const query = {
            text: `
        SELECT id, name, email, created_at
        FROM users
        WHERE id = $1
      `,
            values: [id],
        };

        const result = await this._pool.query(query);

        return result.rows[0];
    }
}

module.exports = UsersService;