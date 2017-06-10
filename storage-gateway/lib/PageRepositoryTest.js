"use strict";

const PageRepository = require("./PageRepository");
const sinon = require("sinon");
const expect = require("chai").expect;
const unirest = require("unirest");

class UnirestStub {
    post() { return this; }
    headers() { return this; }
    auth() { return this; }
    send() { return this; }
    end(callback) { callback({ "ok": true }); }
}

describe("PageRepository", () => {
    describe("#createPage", () => {
        it("should make the correct post request.", () => {
            let unirestStub = new UnirestStub();
            let sendSpy = sinon.spy(unirestStub, "send");
            let repo = new PageRepository(unirestStub);

            // TODO Use chai-as-promise, when it is compatible with chai 4
            /*return createPagePromise.then(() => {

            }, (error) => {
                expect.fail(false, true, "Unexpected error: " + error);
            });*/
        });
    })
});