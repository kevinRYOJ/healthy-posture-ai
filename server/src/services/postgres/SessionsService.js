const pool = require('../../db/pool');
const { nanoid } = require('nanoid');

class SessionsService {
    constructor() {
        this._pool = pool;
    }

    async getSessions(userId) {
        const query = {
            text: `
        SELECT *
        FROM sitting_sessions
        WHERE user_id = $1
        ORDER BY "startTime" DESC
      `,
            values: [userId],
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async addSession({
        userId,
        startTime,
        endTime,
        duration,
        breakTaken,
        totalBreakTime,
    }) {

        const id = `session-${nanoid(16)}`;

        const query = {
            text: `
      INSERT INTO sitting_sessions
      (
        id,
        user_id,
        "startTime",
        "endTime",
        duration,
        "breakTaken",
        "totalBreakTime"
      )
      VALUES($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
    `,
            values: [
                id,               // $1
                userId,           // $2
                startTime,        // $3
                endTime,          // $4
                duration,         // $5
                breakTaken,       // $6
                totalBreakTime,   // $7
            ],
        };

        const result =
            await this._pool.query(query);

        return result.rows[0];
    }
}

module.exports = SessionsService;