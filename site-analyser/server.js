"use strict";

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const logger = require('morgan');

const unirest = require('unirest');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const xpath = require("simple-xpath-position");
const annotationFunctions = require("/conf/site-analyser.conf.js");

const app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

function writeAnnotation(annotation) {
    return new Promise((resolve, reject) => {
        unirest.post("http://storage-api:52629/annotations")
            .followRedirect(false)
            .type("json")
            .send(annotation)
            .end((response) => {
                if (response.status === 303) {
                    resolve("Annotation successfully written!");
                } else {
                    console.log("Could not write...");
                    reject("Annotation not written: " + response.error);
                }
            });
    });
}

function createAnnotation(document, cssSelector, contentType) {
    return new Promise((resolve, reject) => {
        const promises = [];
        document
            .querySelectorAll(cssSelector)
            .forEach((node) => {
                const nodeXpath = xpath.fromNode(node, document.body);

                // TODO: If we trim the textContent, not the whole text in the node is selected
                const nodeTextContent = node.textContent;

                const annotation = {
                    "annotator_schema_version": "v1.0",
                    "text": contentType,
                    "quote": nodeTextContent,
                    "uri": "http://localhost",
                    // TODO: Text is not completely selected!
                    "ranges": [
                        {
                            "start": nodeXpath,
                            "end": nodeXpath,
                            "startOffset": 0,
                            "endOffset": nodeTextContent.length
                        }
                    ],
                    "permissions": {
                        "read": [],
                        "admin": ["technicalUser"],
                        "update": ["technicalUser"],
                        "delete": ["technicalUser"]
                    }
                };

                promises.push(writeAnnotation(annotation));
            });

        Promise
            .all(promises)
            .then(() => {
                resolve(promises.length + " annotations written for '" + cssSelector + "'.");
            }, reason => {
                reject("Writing annotation for " + cssSelector + " failed: " + reason);
            });
    });
}

app.post("/analyse", (request, response) => {
    const job = request.body;

    let getSite = (url) => {
        return new Promise((resolve, reject) => {
            unirest
                .get(url)
                .end((uniRestResponse) => {
                    if (uniRestResponse.ok) {
                        resolve(uniRestResponse.body);
                    } else {
                        reject({"status": uniRestResponse.status, "error": uniRestResponse.error});
                    }
                });
        });
    };

    let createAnnotations = (body) => {
        return new Promise((resolve, reject) => {
            const dom = new JSDOM(body);
            const document = dom.window.document;
            const functions = annotationFunctions.getFunctions();

            const promises = [];
            functions.forEach(annoFunc => {
                promises.push(annoFunc(document, createAnnotation));
            });

            Promise
                .all(promises)
                .then(result => {
                    resolve("All annotations successfully written.");
                }, reason => {
                    reject("Not all annotations could be written: " + reason);
                });
        });
    };

    getSite(job.url)
        .then(createAnnotations)
        .then(() => {
            console.log("Everything is fine!");
            response.status(201).end();
        })
        .catch(reason => {
            console.log("Error: " + reason);
            response
                .status(500)
                .json({ "error": reason });
        });
});

app.listen(44284, function () {
    console.log("Analyser service started...");
});