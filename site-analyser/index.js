"use strict";

const unirest = require('unirest');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const xpath = require("simple-xpath-position");

function createAnnotation(document, cssSelector) {
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

            unirest.post("http://localhost:52629/annotations")
                .headers({
                    "Content-Type": "application/json; charset=UTF-8",
                })
                .followRedirect(false)
                .send(annotation)
                .end((response) => {
                    if (response.status === 303) {
                        console.log("Annotation written.");
                    } else {
                        console.log("Annotation not written: " + response.error);
                    }
                });
        });
}

unirest.get("http://localhost")
   .end((response) => {
       if (response.ok) {
           const dom = new JSDOM(response.body);
           const document = dom.window.document;

           createAnnotation(document, "h1");
           createAnnotation(document, ".important-text");
       } else {
           console.log("Could not fetch site.")
       }
   });