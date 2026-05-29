const { calcHealthScore } = require('../../utils/healthScore');

class SessionsHandler {
    constructor(service, usersService) {
        this._service = service;
        this._usersService = usersService;

        this.getSessionsHandler =
            this.getSessionsHandler.bind(this);

        this.postSessionHandler =
            this.postSessionHandler.bind(this);

        this.deleteSessionsHandler =
            this.deleteSessionsHandler.bind(this);
    }

    async getSessionsHandler(req, res) {
        try {
            const userId = req.user.id;
            const sessions = await this._service.getSessions(userId);
            const user = await this._usersService.getUserById(userId);

            const baseHealthScore = calcHealthScore(sessions, user);

            return res.json({
                status: 'success',
                baseHealthScore,
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

            const sessions = await this._service.getSessions(userId);
            const user = await this._usersService.getUserById(userId);
            const baseHealthScore = calcHealthScore(sessions, user);

            return res.status(201).json({
                status: 'success',
                baseHealthScore,
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
        const { id: credentialId } = req.auth.credentials;
        await this._service.deleteAllSessionsByUserId(credentialId);

        return res.json({
            status: 'success',
            message: 'Riwayat sesi berhasil dihapus',
        });
    }
}

module.exports = SessionsHandler;