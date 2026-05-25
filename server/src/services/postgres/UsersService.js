const pool = require('../../db/pool');
const { nanoid } = require('nanoid');

class UsersService {
    constructor() {
        this._pool = pool;
    }

    async addUser({
        name,
        email,
        password,
    }) {
        const id = `user-${nanoid(16)}`;

        const query = {
            text: `
        INSERT INTO users
        (
          id,
          name,
          email,
          password
        )
        VALUES($1, $2, $3, $4)
        RETURNING id, name, email
      `,
            values: [
                id,
                name,
                email,
                password,
            ],
        };

        const result =
            await this._pool.query(query);

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

        const result =
            await this._pool.query(query);

        return result.rows[0];
    }

    async getUserById(id) {
        const query = {
            text: `
        SELECT
          id,
          name,
          email,
          created_at,
          has_personalized,
          age,
          bmi,
          sleep_hours,
          gender,
          work_type,
          fitness_level,
          device_preference
        FROM users
        WHERE id = $1
      `,
            values: [id],
        };

        const result =
            await this._pool.query(query);

        return result.rows[0];
    }

    async updatePersonalization(id, data) {
        const query = {
            text: `
        UPDATE users
        SET
          has_personalized = true,
          age = $2,
          bmi = $3,
          sleep_hours = $4,
          gender = $5,
          work_type = $6,
          fitness_level = $7,
          device_preference = $8
        WHERE id = $1
        RETURNING id
      `,
            values: [
                id,
                data.age,
                data.bmi,
                data.sleep_hours,
                data.gender,
                data.work_type,
                data.fitness_level,
                data.device_preference,
            ],
        };

        await this._pool.query(query);
    }
}

module.exports = UsersService;