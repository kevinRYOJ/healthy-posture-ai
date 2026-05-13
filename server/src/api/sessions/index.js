const routes = require('./routes');
const SessionsHandler = require('./handler');

module.exports = () => {
    const handler = new SessionsHandler();

    return routes(handler);
};