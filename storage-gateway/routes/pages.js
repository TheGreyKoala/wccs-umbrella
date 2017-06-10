"use strict";

const express = require('express');
const router = express.Router();
const unirest = require("unirest");
const pageRepository = new (require("../lib/PageRepository"))(unirest);

router.post('/', (request, response) => {
    let createPagePromise = pageRepository.createPage(request.body);
    createPagePromise.then(() => {
        response.json({"name": "SUCCESS"});
    }, (error) => {
        console.log(error);
        response.status(500).json({ "error": "Unexpected error. See log for details." });
    });
});

module.exports = router;
