const jwt = require('jsonwebtoken');

const TokenManager = {
    generateAccessToken: (payload) =>
        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '7d',
        }),
};

module.exports = TokenManager;