const routes = require('./routes');
const SessionsHandler = require('./handler');

const SessionsService = require(
    '../../services/postgres/SessionsService'
);

module.exports = () => {
    const service = new SessionsService();

    const handler =
        new SessionsHandler(service);

    return routes(handler);
};