"use strict";

const unirest = require('unirest');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const xpath = require("simple-xpath-position");

function createAnnotation(document, cssSelector) {
    const promises = [];
    document.querySelectorAll(cssSelector)
        .forEach((node) => {
            const nodeXpath = xpath.fromNode(node, document.body);

            // TODO: If we trim the textContent, not the whole text in the node is selected
            const nodeTextContent = node.textContent;

            const annotation = {
                "annotator_schema_version": "v1.0",
                "text": "This was generated automatically",
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

           Promise.all(createAnnotation(document, "#content h3"))
               .then(values => values.forEach(value => console.log(value)), error => console.log(error));
           Promise.all(createAnnotation(document, "h4.panel-title")).then(values => values.forEach(value => console.log(value)), error => console.log(error));
           Promise.all(createAnnotation(document, "div.hrf-content")).then(values => values.forEach(value => console.log(value)), error => console.log(error));
       } else {
           console.log("Could not fetch site.")
       }
   });