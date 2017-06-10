"use strict";

const NEO4J_USER = "neo4j";
const NEO4J_PASSWORD = "z24yLDCYZympaqgy";
const pageBatchJobFactory = require("./PageBatchJobFactory");

module.exports = class PageRepository {
    constructor(restClient) {
        this.restClient = restClient;
    }

    createPage(page) {
        let batchJob = pageBatchJobFactory.createPageBatchJob(page);
        return new Promise((resolve, reject) => {
            try {
                this.restClient
                    .post("http://storage:7474/db/data/batch")
                    .headers({
                        "Accept": "application/json;charset=utf-8",
                        "Content-Type": "application/json",
                    })
                    .auth(NEO4J_USER, NEO4J_PASSWORD)
                    .send(batchJob)
                    .end(response => {
                        if (response.ok) {
                            resolve(true);
                        } else {
                            console.log(response);
                            reject({"status": response.status, "body": response.body});
                        }
                    });
            } catch (e) {
                reject(e);
            }
        });
    }

    getPage(id) {

    }
};