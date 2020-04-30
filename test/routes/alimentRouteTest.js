const supertest = require("supertest");
const chai = require("chai");

require("../rootHooks");

const { app } = require("../../src/app");

const request = supertest(app);
const expect = chai.expect;
chai.use(require('chai-things'));

describe("Aliment route", function() {
    const aliment = {
        nombre: "FakeAliment",
        descripcion: "FakeDescription",
        calorias: '300',
        idComida: undefined,
    }
    beforeEach(async function(){
        const user = {
            nombre: "fakeName",
            email: "fake@example.com",
            password: "fakeHash"
        }

        const diet = {
            nombre: "FakeDiet",
            descripcion: "FakeDescription",
            idUser: undefined
        }

        let res = await request.post("/user")
            .set("Accept", "application/json")
            .send(user)
        diet.idUser = res.body.id;

        res = await request.post("/diet")
            .set("Accept", "application/json")
            .send(diet)
        aliment.idComida = res.body.idelemento;
    });

    describe("POST /aliment", function() {
        it("should create an aliment", async function() {            
            const res = await request.post("/aliment")
                .set("Accept", "application/json")
                .send(aliment)
                .expect(201);
            expect(res.body).to.have.property("idAlimento");
        });

        it("should not create an aliment if parameters are missing", async function() {
            const fakeAliment = { }
            await request.post("/diet")
                .set("Accept", "application/json")
                .send(fakeAliment)
                .expect(400);
        });
    });

    describe("DELETE /aliment/{id}", async function() {
        it("should delete an aliment", async function() {
            const res = await request.post("/aliment")
                .set("Accept", "application/json")
                .send(aliment);
            const idAliment = res.body.idAlimento;
            await request.delete(`/aliment/${idAliment}`)
                .expect(200);
        });

        it("should not delete a badly formated id", async function() {
            await request.delete(`/aliment/badId`).expect(400);
        });
    });

    describe("PUT /aliment/{id}", function() {
        it("should update the given aliment", async function() {
            const res = await request.post("/aliment")
                .set("Accept", "application/json")
                .send(aliment);
            const idAliment = res.body.idAlimento;
            
            let newAliment = {
                nombre: "AlimentTest2",
                descripcion: "descriptionTest2",
                calorias: '500',
            };
            await request.put(`/aliment/${idAliment}`)
                .set("Accept", "application/json")
                .send(newAliment)    
                .expect(200);
        });

        it("should not modify a badly formated id", async function() {
            await request.put(`/aliment/badId`).expect(400);
        });
    });
});