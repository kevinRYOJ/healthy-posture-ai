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
}

module.exports = UsersHandler;