"use strict";

const Neo4jJob = require("./Neo4jJob");

module.exports.createPageBatchJob = function(page) {
    let nextJobIndex = 0;

    function createPropertyJob(property, jobs) {
        let propertyJobIndex = nextJobIndex;

        jobs.push(new Neo4jJob(nextJobIndex++, "POST", "/node", { "type": property.type }));
        jobs.push(new Neo4jJob(nextJobIndex++, "POST", "{" + propertyJobIndex + "}/labels", "Content"));

        if (property.properties) {
            createPropertiesJobs(property, jobs, propertyJobIndex);
        }
    }

    function createPropertiesJobs(object, jobs, objectJobIndex) {
        Object.keys(object.properties).forEach((name) => {
            let property = object.properties[name];

            if (Array.isArray(property)) {
                property.forEach((propertyItem) => {
                    let propertyJobIndex = nextJobIndex;
                    createPropertyJob(propertyItem, jobs);
                    jobs.push(new Neo4jJob(nextJobIndex++, "POST", "{" + objectJobIndex + "}/relationships", { "to": "{" + propertyJobIndex + "}", "type": name }));
                });
            } else {
                let propertyJobIndex = nextJobIndex;
                createPropertyJob(property, jobs);
                jobs.push(new Neo4jJob(nextJobIndex++, "POST", "{" + objectJobIndex + "}/relationships", { "to": "{" + propertyJobIndex + "}", "type": name }));
            }
        });
    }

    let jobs = [
        new Neo4jJob(nextJobIndex++, "POST", "/node", { "url": page.url, "type": page.type }),
        new Neo4jJob(nextJobIndex++, "POST", "{0}/labels", "Page")
    ];

    createPropertiesJobs(page, jobs, 0);
    return jobs;
};