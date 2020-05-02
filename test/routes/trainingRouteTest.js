const supertest = require("supertest");

require("../rootHooks");

const expect = require('../chaiConfig')
const { app } = require("../../src/app");

const request = supertest(app);

describe("Training route", function() {
    const fakeTraining = {
        nombre: "FakeTraining",
        descripcion: "FakeDescription",
        idUser: undefined
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
        fakeTraining.idUser = res.body.id;
    });

    describe("POST /training", function() {
        it("should create a training", async function() {            
            const res = await request.post("/training")
                .set("Content-Type", "application/json")
                .send(fakeTraining)
                .expect(201);
            expect(res.body).to.have.property("idElemento");
        });

        it("should not create a training if parameters are missing", async function() {
            const fakeTraining = { }
            await request.post("/training")
                .set("Content-Type", "application/json")
                .send(fakeTraining)
                .expect(400);
        });
    });

    describe("DELETE /training/{id}", async function() {
        it("should delete a training", async function() {
            const res = await request.post("/training")
                .set("Content-Type", "application/json")
                .send(fakeTraining);
            const idTraining = res.body.idElemento;
            await request.delete(`/training/${idTraining}`)
                .expect(200);
        });

        it("should not delete a badly formated id", async function() {
            await request.delete(`/training/badId`).expect(400);
        });
    });

    describe("PUT /training/{id}", function() {
        it("should update the given training", async function() {
            const res = await request.post("/training")
                .set("Content-Type", "application/json")
                .send(fakeTraining);
            const idTraining = res.body.idElemento;
            
            const newFakeTraining = {
                nombre: "NewFakeName",
                descripcion: "NewFakeDescription"
            }
            await request.put(`/training/${idTraining}`)
                .set("Content-Type", "application/json")
                .send(newFakeTraining)    
                .expect(200);
        });
    });
});