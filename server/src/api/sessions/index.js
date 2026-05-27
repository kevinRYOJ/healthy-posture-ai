const routes = require('./routes');
const SessionsHandler = require('./handler');

const SessionsService = require(
    '../../services/postgres/SessionsService'
);
const UsersService = require('../../services/postgres/UsersService');

module.exports = () => {
    const service = new SessionsService();
    const usersService = new UsersService();

    const handler =
        new SessionsHandler(service, usersService);

    return routes(handler);
};