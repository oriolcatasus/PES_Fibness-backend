const supertest = require("supertest");

require("../rootHooks");

const expect = require('../chaiConfig')
const { app } = require("../../src/app");

const request = supertest(app);

describe("Statistic's route", function() {
    const fakeStatistic = {
        idUser: undefined,
        dstRecorrida:"40",
    }
    const fakeStatistic2 = {
        idUser: undefined,
        dstRecorrida:"60",
    }

    beforeEach(async function(){
        const fakeUser = {
            nombre: "fakeName",
            email: "fake@example.com",
            password: "fakeHash"
        }
        const res = await request.post("/user")
            .set("Content-Type", "application/json")
            .send(fakeUser)
        fakeStatistic.idUser = res.body.id;
        fakeStatistic2.idUser = res.body.id;
    });

    describe("POST /statistic to create", function() {
        it("should create a statistic", async function() {            
            await request.post("/statistic")
                .set("Content-Type", "application/json")
                .send(fakeStatistic)
                .expect(201);
        });    
        it("should not create a statistic if parameters are missing", async function() {
            const fakeRoute = { }
            await request.post("/statistic")
                .set("Content-Type", "application/json")
                .send(fakeRoute)
                .expect(400);
            console.log("ya esta creado");
        });
    });

    describe("POST /statistic to update", function() {
        it("should update a statistic", async function() { 
            await request.post("/statistic")
                .set("Content-Type", "application/json")
                .send(fakeStatistic)
                .expect(201);
            //this part is the one that meke the update
            await request.post("/statistic")
                .set("Content-Type", "application/json")
                .send(fakeStatistic2)
                .expect(200);
        });
        it("should not create a statistic if parameters are missing", async function() {
            const fakeRoute = { }
            await request.post("/statistic")
                .set("Content-Type", "application/json")
                .send(fakeRoute)
                .expect(400);
        });
    });
});