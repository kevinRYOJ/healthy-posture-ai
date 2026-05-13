const Joi = require('joi');

const UserPayloadSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(100)
        .required(),

    email: Joi.string()
        .email()
        .required(),

    password: Joi.string()
        .min(6)
        .required(),

    confirmPassword: Joi.string()
        .required(),
});

module.exports = {
    UserPayloadSchema,
};