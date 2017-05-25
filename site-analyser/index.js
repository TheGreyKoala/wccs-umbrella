"use strict";

const unirest = require('unirest');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const xpath = require("simple-xpath-position");
const annotationFunctions = require("./site-analyser.conf.js")

function createAnnotation(document, cssSelector, contentType) {
    const promises = [];
    document.querySelectorAll(cssSelector)
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
                ]
            };

            promises.push(new Promise((resolve, reject) => {
                unirest.post("http://localhost:52629/annotations")
                    .followRedirect(false)
                    .type("json")
                    .send(annotation)
                    .end((response) => {
                        if (response.status === 303) {
                            resolve("Annotation successfully written!");
                        } else {
                            reject("Annotation not written: " + response.error);
                        }
                    });
            }));
        });
    return promises;
}

unirest.get("http://localhost")
   .end((response) => {
       if (response.ok) {
           const dom = new JSDOM(response.body);
           const document = dom.window.document;

		   const functions = annotationFunctions.getFunctions();

		   functions.forEach(annoFun => {
			   Promise.all(annoFun(document, createAnnotation))
			   .then(values => values.forEach(value => console.log(value)), error => console.log(error));
		   });
       } else {
           console.log("Could not fetch site.")
       }
   });
