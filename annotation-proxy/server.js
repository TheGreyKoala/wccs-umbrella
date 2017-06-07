"use strict";

const express = require('express');
const unirest = require('unirest');

const app = express();

app.get("/", (request, response) => {
    let getPromise = new Promise((resolve, reject) => {
        unirest
            .get(request.query.url)
            .end((wpResponse) => {
                if (wpResponse.ok) {
                    resolve(wpResponse.body);
                } else {
                    reject({"status": wpResponse.status, "body": wpResponse.body});
                }
            });
    });

    getPromise.then(body => {
        response.status(200).send(body);
    }, error => {
        response.status(error.status).send(error.body);
    });
});

app.listen(29136, function () {
    console.log("Annotation proxy service started...");
});