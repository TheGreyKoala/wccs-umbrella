"use strict";

const express = require('express');
const router = express.Router();

router.get('/', (request, response, next) => {
    response.json({"name": "Annotator Store API", "version": "2.0.0"});
});

module.exports = router;
