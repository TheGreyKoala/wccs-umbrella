"use strict";

module.exports = class Neo4jJob {
    constructor(id, method, to, body) {
        this.id = id;
        this.method = method;
        this.to = to;
        this.body = body;
    }
};