const express = require('express');

const routes = (handler) => {
    const router = express.Router();

    router.post('/', handler.postAuthenticationHandler);

    return router;
};

module.exports = routes;