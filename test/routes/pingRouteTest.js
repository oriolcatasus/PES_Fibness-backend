const supertest = require("supertest");

require("../rootHooks");

const { app } = require("../../src/app");
const request = supertest(app);

describe("GET /test", function() {
    it("should return OK", async function() {
        await request.get(`/test`)
            .expect(201);
    });
});