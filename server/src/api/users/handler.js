const bcrypt = require('bcryptjs');
const UsersValidator = require('../../validations/users');

class UsersHandler {
    constructor(usersService, validator) {
        this._usersService = usersService;
        this._validator = validator;

        this.postUserHandler = this.postUserHandler.bind(this);
    }

    async postUserHandler(req, res) {
        try {
            const {
                name,
                email,
                password,
                confirmPassword,
            } = req.body;

            // validasi field kosong
            this._validator.validateUserPayload(
                req.body
            );

            // validasi password match
            if (password !== confirmPassword) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Konfirmasi password tidak cocok',
                });
            }

            // cek email
            const existingUser =
                await this._usersService.getUserByEmail(email);

            if (existingUser) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Email sudah digunakan',
                });
            }

            // hash password
            const hashedPassword =
                await bcrypt.hash(password, 10);

            // insert user
            const addedUser =
                await this._usersService.addUser({
                    name,
                    email,
                    password: hashedPassword,
                });

            return res.status(201).json({
                status: 'success',
                message: 'User berhasil dibuat',
                data: {
                    user: addedUser,
                },
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }

    async putPersonalizationHandler(req, res) {
        try {
            // Note: Since this is users endpoint without auth middleware in routes,
            // we should probably check authorization header manually or apply auth middleware.
            // Wait, does users/routes.js have auth middleware? No, it's just express.Router().
            // We need to verify token here or use auth middleware.
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
            }
            const token = authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
            }
            const TokenManager = require('../../utils/tokenManager');
            let decoded;
            try {
                decoded = TokenManager.verifyAccessToken(token);
            } catch (err) {
                return res.status(401).json({ status: 'fail', message: 'Token invalid' });
            }

            const {
                age,
                bmi,
                sleep_hours,
                gender,
                work_type,
                fitness_level,
                device_preference
            } = req.body;

            await this._usersService.updatePersonalization(decoded.id, {
                age,
                bmi,
                sleep_hours,
                gender,
                work_type,
                fitness_level,
                device_preference
            });

            return res.status(200).json({
                status: 'success',
                message: 'Profil berhasil diperbarui'
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    }
}

module.exports = UsersHandler;