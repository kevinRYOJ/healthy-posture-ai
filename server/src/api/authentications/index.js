const AuthenticationsHandler =
    require('./handler');

const routes = require('./routes');

const UsersService =
    require('../../services/postgres/UsersService');

const AuthenticationsValidator =
    require('../../validations/authentications');

module.exports = () => {
    const usersService =
        new UsersService();

    const handler =
        new AuthenticationsHandler(
            usersService,
            AuthenticationsValidator
        );

    return routes(handler);
};