const Joi = require('joi');

const AuthenticationPayloadSchema =
    Joi.object({
        email: Joi.string()
            .email()
            .required(),

        password: Joi.string()
            .required(),
    });

module.exports = {
    AuthenticationPayloadSchema,
};