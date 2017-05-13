"use strict";

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const logger = require('morgan');

const app = express();
const index = require('./routes/index');
const annotations = require('./routes/annotations');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use((request, response, next) => {
    response.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
        "Access-Control-Allow-Methods": "DELETE, GET, POST, PUT"
    });
    next();
});

app.use('/', index);
app.use('/annotations', annotations);

/*
 * Handle not found error
 */
app.use((request, response, next) => {
    let error = new Error('Resource not found');
    error.status = 404;
    next(error);
});

app.use((error, request, response, next) => {
    response.status(error.status || 500)
        .json({"error_message": error.message || "Unknown error"});
});

app.listen(52629, function () {
    console.log("Server started...");
});
