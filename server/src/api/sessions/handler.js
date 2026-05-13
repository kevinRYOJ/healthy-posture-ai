class SessionsHandler {
    constructor() {
        this.sessions = [];
    }

    getSessionsHandler = async (req, res) => {
        return res.json({
            status: 'success',
            data: this.sessions,
        });
    };

    postSessionHandler = async (req, res) => {
        this.sessions.push(req.body);

        return res.json({
            status: 'success',
            message: 'Session berhasil ditambahkan',
        });
    };

    deleteSessionsHandler = async (req, res) => {
        this.sessions = [];

        return res.json({
            status: 'success',
            message: 'Semua session dihapus',
        });
    };
}

module.exports = SessionsHandler;