const express = require('express');

const routes = (handler) => {
    const router = express.Router();

    router.get('/', handler.getSessionsHandler);
    router.post('/', handler.postSessionHandler);
    router.delete('/', handler.deleteSessionsHandler);

    return router;
};

module.exports = routes;