const UsersHandler = require('./handler');
const routes = require('./routes');

const UsersService = require('../../services/postgres/UsersService');
const UsersValidator = require('../../validations/users');

module.exports = () => {
    const usersService = new UsersService();

    const handler =
        new UsersHandler(
            usersService,
            UsersValidator
        );

    return routes(handler);
};