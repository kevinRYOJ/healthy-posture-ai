class SessionsHandler {
    constructor(service) {
        this._service = service;

        this.getSessionsHandler =
            this.getSessionsHandler.bind(this);

        this.postSessionHandler =
            this.postSessionHandler.bind(this);

        this.deleteSessionsHandler =
            this.deleteSessionsHandler.bind(this);
    }

    async getSessionsHandler(req, res) {
        try {
            const sessions =
                await this._service.getSessions();

            return res.json({
                status: 'success',
                sessions,
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                status: 'error',
                message: 'Gagal mengambil sessions',
            });
        }
    }

    async postSessionHandler(req, res) {
        try {

            const userId = req.user.id;

            const session =
                await this._service.addSession({
                    userId,
                    ...req.body,
                });

            return res.status(201).json({
                status: 'success',
                session,
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                status: 'error',
                message: 'Gagal menyimpan session',
            });
        }
    }

    async deleteSessionsHandler(req, res) {
        return res.json({
            status: 'success',
            message: 'Belum diimplementasikan',
        });
    }
}

module.exports = SessionsHandler;