const supertest = require("supertest");

require("../rootHooks");

const expect = require('../chaiConfig')
const { app } = require("../../src/app");

const request = supertest(app);

describe("Route's route", function() {
    const fakeRoute = {
        nombre: "FakeRoute",
        descripcion: "FakeDescription",
        origen:"origen",
        destino:"destino",
        distancia:"distancia",
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
        fakeRoute.idUser = res.body.id;
    });

    describe("POST /route", function() {
        it("should create a route", async function() {            
            const res = await request.post("/route")
                .set("Content-Type", "application/json")
                .send(fakeRoute)
                .expect(201);
            expect(res.body).to.have.property("idElemento");
        });

        it("should not create a route if parameters are missing", async function() {
            const fakeRoute = { }
            await request.post("/route")
                .set("Content-Type", "application/json")
                .send(fakeRoute)
                .expect(400);
        });
    });

    describe("DELETE /route/{id}", async function() {
        it("should delete a route", async function() {
            const res = await request.post("/route")
                .set("Content-Type", "application/json")
                .send(fakeRoute);
            const idRoute = res.body.idElemento;
            await request.delete(`/route/${idRoute}`)
                .expect(200);
        });

        it("should not delete a badly formated id", async function() {
            await request.delete(`/route/badId`).expect(400);
        });
    });

    describe("PUT /route/{id}", function() {
        it("should update the given route", async function() {
            const res = await request.post("/route")
                .set("Content-Type", "application/json")
                .send(fakeRoute);
            const idRoute = res.body.idElemento;
            
            const newFakeRoute = {
                nombre: "FakeRoute",
                descripcion: "FakeDescription",
                origen:"origen_1",
                destino:"destino_1",
                distancia:"distancia_1",
            }
            await request.put(`/route/${idRoute}`)
                .set("Content-Type", "application/json")
                .send(newFakeRoute)    
                .expect(200);
        });
    });
});