const express = require('express');
const auth = require('../../middlewares/auth');

const routes = (handler) => {
    const router = express.Router();

    router.get(
        '/',
        auth,
        handler.getSessionsHandler
    );

    router.post(
        '/',
        auth,
        handler.postSessionHandler
    );

    router.delete(
        '/',
        auth,
        handler.deleteSessionsHandler
    );

    return router;
};

module.exports = routes;