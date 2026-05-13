const bcrypt = require('bcryptjs');
const AuthenticationsValidator = require('../../validations/authentications');
const TokenManager = require('../../utils/tokenManager');

class AuthenticationsHandler {
    constructor(usersService, validator) {
        this._usersService = usersService;
        this._validator = validator;

        this.postAuthenticationHandler =
            this.postAuthenticationHandler.bind(this);
    }

    async postAuthenticationHandler(req, res) {
        try {
            this._validator
                .validateAuthenticationPayload(
                    req.body
                );
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Email dan password wajib diisi',
                });
            }

            // cek user
            const user =
                await this._usersService.getUserByEmail(email);

            if (!user) {
                return res.status(401).json({
                    status: 'fail',
                    message: 'Email atau password salah',
                });
            }

            // compare password
            const match =
                await bcrypt.compare(password, user.password);

            if (!match) {
                return res.status(401).json({
                    status: 'fail',
                    message: 'Email atau password salah',
                });
            }

            // generate token
            const accessToken =
                TokenManager.generateAccessToken({
                    id: user.id,
                    email: user.email,
                });

            return res.status(200).json({
                status: 'success',
                message: 'Login berhasil',
                token: accessToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
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
}

module.exports = AuthenticationsHandler;