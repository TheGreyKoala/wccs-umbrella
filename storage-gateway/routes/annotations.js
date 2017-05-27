"use strict";

const express = require('express');
const router = express.Router();
const unirest = require('unirest');
const jsesc = require('jsesc');

const NEO4J_USER = "neo4j";
const NEO4J_PASSWORD = "z24yLDCYZympaqgy";

router.route('/')
    .get((request, response) => {
        unirest
            .get("http://storage:7474/db/data/label/Annotation/nodes")
            .headers({
                "Accept": "application/json;charset=utf-8",
                "Content-Type": "application/json",
            })
            .auth(NEO4J_USER, NEO4J_PASSWORD)
            .end((neo4jResponse) => {
                if (neo4jResponse.ok) {
                    let annotations = neo4jResponse.body.map((node) => {
                        return JSON.parse(node.data.annotation);
                    });
                    response.json(annotations);
                } else {
                    response.status(500).send("ERROR");
                }
            });
    })
    .post((request, response) => {
        // create

        try {
            // TODO: No ranges in annotations?!
            const annotation = request.body;
            annotation.created = new Date().toISOString();
            annotation.updated = request.body.created;

            unirest
                .post("http://storage:7474/db/data/node")
                .headers({
                    "Accept": "application/json;charset=utf-8",
                    "Content-Type": "application/json",
                })
                .auth(NEO4J_USER, NEO4J_PASSWORD)
                .send({"annotation": JSON.stringify(annotation)})
                .end((neo4jResponse) => {
                    if (neo4jResponse.ok) {
                        const annotationId = neo4jResponse.body.metadata.id;

                        console.log("Annotation successfully created.");
                        console.log("Adding label: " + "http://storage:7474/db/data/node/" + annotationId + "/labels");
                        unirest
                            .post("http://storage:7474/db/data/node/" + annotationId + "/labels")
                            .headers({
                                "Accept": "application/json;charset=utf-8",
                            })
                            .auth(NEO4J_USER, NEO4J_PASSWORD)
                            .send("\"Annotation\"")
                            .type('application/json')
                            .end((neo4jResponse2) => {
                                if (neo4jResponse2.ok) {
                                    console.log("Annotation label successfully set.");
                                    console.log("Setting annotation id");

                                    annotation.id = annotationId;

                                    putRequest(annotationId, annotation, (neo4jResponse3) => {
                                        if (neo4jResponse3.ok) {
                                            console.log("Annotation id set");
                                            response.status(303)
                                                .location("/annotations/" + annotationId)
                                                .end();
                                        } else {
                                            console.error("Annotation id could not be set: " + neo4jResponse3.error);
                                            response.status(500).send("Error");
                                        }
                                    });
                                } else {
                                    console.error("Annotation label could not be set: " + neo4jResponse2.error);
                                    response.status(500).send("Error");
                                }
                            });
                    } else {
                        console.error("Annotation could not be created: " + neo4jResponse.error);
                        response.status(500).send("Error");
                    }
                });
            console.log("End of create method.");
        } catch (e) {
            console.error(e);
            response.status(500).send("Error");
        }
    });

function putRequest(id, annotation, callback) {
    const annotationAsString = jsesc(JSON.stringify(annotation), {
        "json": true
    });
    unirest
        .put("http://storage:7474/db/data/node/" + id + "/properties/annotation")
        .headers({
            "Accept": "application/json;charset=utf-8",
        })
        .auth(NEO4J_USER, NEO4J_PASSWORD)
        .send(annotationAsString)
        .type("json")
        .end(callback);
}

router.route('/:id')
    .get((request, response) => {
        // read

        unirest
            .get("http://storage:7474/db/data/node/" + request.params.id)
            .headers({
                "Accept": "application/json;charset=utf-8",
                "Content-Type": "application/json",
            })
            .auth(NEO4J_USER, NEO4J_PASSWORD)
            .end((neo4jResponse) => {
                if (neo4jResponse.ok) {
                    response.json(JSON.parse(neo4jResponse.body.data.annotation));
                } else {
                    response.status(500).send("ERROR");
                }
            });
    })
    .put((request, response) => {
        // update

        const annotationId = request.params.id;
        request.body.updated = new Date().toISOString();

        putRequest(annotationId, request.body, (neo4jResponse) => {
            if (neo4jResponse.ok) {
                response.status(303)
                    .location("/annotations/" + annotationId)
                    .end();
            } else {
                response.status(500).send("ERROR");
            }
        });
    })
    .delete((request, response) => {
        // delete

        unirest
            .delete("http://storage:7474/db/data/node/" + request.params.id)
            .headers({
                "Accept": "application/json;charset=utf-8",
                "Content-Type": "application/json",
            })
            .auth(NEO4J_USER, NEO4J_PASSWORD)
            .end((neo4jResponse) => {
                if (neo4jResponse.ok) {
                    response.status(204).end();
                } else {
                    response.status(500).send("ERROR");
                }
            });
    });

module.exports = router;
