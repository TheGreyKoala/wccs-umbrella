"use strict";

const pageBatchJobFactory = require("./PageBatchJobFactory");
const expect = require("chai").expect;

describe("#createPageBatchJob", () => {
    it("should compute the batch jobs correctly.", () => {
        const testPage = {
            "url": "http://myhost/myfolder/mypage",
            "type": "MyPageType",
            "properties": {
                "my_property_1": {
                    "type": "MyProperty1Type"
                },
                "my_property_2": {
                    "type": "MyProperty2Type",
                    "properties": {
                        "my_property_2.1": {
                            "type": "MyProperty2.1Type"
                        },
                        "my_property_2.2": {
                            "type": "MyProperty2.2Type"
                        }
                    }
                },
                "my_property_3": [
                    {
                        "type": "MyProperty3Type"
                    },
                    {
                        "type": "MyProperty3.1Type"
                    }
                ]
            }
        };

        let batchJobs = pageBatchJobFactory.createPageBatchJob(testPage);

        expect(batchJobs).to.eql([
            { "id": 0, "method": "POST", "to": "/node", "body": { "url": "http://myhost/myfolder/mypage", "type": "MyPageType" } },
            { "id": 1, "method": "POST", "to": "{0}/labels", "body": "Page" },
            { "id": 2, "method": "POST", "to": "/node", "body": { "type": "MyProperty1Type" } },
            { "id": 3, "method": "POST", "to": "{2}/labels", "body": "Content" },
            { "id": 4, "method": "POST", "to": "{0}/relationships", "body": { "to": "{2}", "type": "my_property_1" } },
            { "id": 5, "method": "POST", "to": "/node", "body": { "type": "MyProperty2Type" } },
            { "id": 6, "method": "POST", "to": "{5}/labels", "body": "Content" },
            { "id": 7, "method": "POST", "to": "/node", "body": { "type": "MyProperty2.1Type" } },
            { "id": 8, "method": "POST", "to": "{7}/labels", "body": "Content" },
            { "id": 9, "method": "POST", "to": "{5}/relationships", "body": { "to": "{7}", "type": "my_property_2.1" } },
            { "id": 10, "method": "POST", "to": "/node", "body": { "type": "MyProperty2.2Type" } },
            { "id": 11, "method": "POST", "to": "{10}/labels", "body": "Content" },
            { "id": 12, "method": "POST", "to": "{5}/relationships", "body": { "to": "{10}", "type": "my_property_2.2" } },
            { "id": 13, "method": "POST", "to": "{0}/relationships", "body": { "to": "{5}", "type": "my_property_2" } },
            { "id": 14, "method": "POST", "to": "/node", "body": { "type": "MyProperty3Type" } },
            { "id": 15, "method": "POST", "to": "{14}/labels", "body": "Content" },
            { "id": 16, "method": "POST", "to": "{0}/relationships", "body": { "to": "{14}", "type": "my_property_3" } },
            { "id": 17, "method": "POST", "to": "/node", "body": { "type": "MyProperty3.1Type" } },
            { "id": 18, "method": "POST", "to": "{17}/labels", "body": "Content" },
            { "id": 19, "method": "POST", "to": "{0}/relationships", "body": { "to": "{17}", "type": "my_property_3" } }
        ]);
    })
});