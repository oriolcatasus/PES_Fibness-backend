const supertest = require("supertest");
const chai = require("chai");

require("../rootHooks");

const { app } = require("../../src/app");

const request = supertest(app);
const expect = chai.expect;
chai.use(require('chai-things'));

describe("Meal route", function() {
    const meal = {
        nombre: "MealTest",
        horaComida: '22:00:00',
        idElemento: undefined,
        tipoDia: "miercoles",
    };
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
        meal.idElemento = res.body.idElemento;
    });

    describe("POST /meal", function() {
        it("should create a meal", async function() {            
            const res = await request.post("/meal")
                .set("Accept", "application/json")
                .send(meal)
                .expect(201);
            expect(res.body).to.have.property("idComida");
        });

        it("should not create a meal if parameters are wrong", async function() {
            const fakeMeal = {
                tipoDia: "notADayOfTheWeek",
                idElemento: -1,
            };
            await request.post("/meal")
                .set("Accept", "application/json")
                .send(fakeMeal)
                .expect(400);
        });
    });

    describe("DELETE /meal/{id}", async function() {
        it("should delete a meal", async function() {
            const res = await request.post("/meal")
                .set("Accept", "application/json")
                .send(meal);
            const idComida = res.body.idComida;
            await request.delete(`/meal/${idComida}`)
                .expect(200);
        });

        it("should not delete a badly formated id", async function() {
            await request.delete(`/meal/badId`).expect(400);
        });
    });

    describe("PUT /meal/{id}", function() {
        it("should update the given meal", async function() {
            const res = await request.post("/meal")
                .set("Accept", "application/json")
                .send(meal);
            const idComida = res.body.idComida;
            
            const newMeal = {
                nombre: "MealTest2",
                horaComida: '10:00:00',
            };
            await request.put(`/meal/${idComida}`)
                .set("Accept", "application/json")
                .send(newMeal)    
                .expect(200);
        });

        it("should not modify a badly formated id", async function() {
            await request.put(`/meal/badId`).expect(400);
        });
    });

    describe("GET /meal/{id}", function() {
        it("should return an array of aliments", async function() {
            let res = await request.post("/meal")
                .set("Accept", "application/json")
                .send(meal);
            const idMeal = res.body.idComida;

            const newAliment = {
                nombre: "FakeAliment",
                descripcion: "FakeDescription",
                calorias: '300',
                idComida: idMeal,
            };

            const newAliment2 = {
                nombre: "FakeAliment2",
                descripcion: "FakeDescription2",
                calorias: '780',
                idComida: idMeal,
            };

            await request.post("/aliment")
                .set("Accept", "application/json")
                .send(newAliment);

            await request.post("/aliment")
                .set("Accept", "application/json")
                .send(newAliment2);

            res = await request.get(`/meal/${idMeal}/aliments`)
                .expect('Content-Type', /json/)
                .expect(200);
            const aliments = res.body;
            expect(aliments).to.be.an('array');
            expect(aliments[0]).to.have.property("calorias");
            expect(aliments[1].nombre).to.equal("FakeAliment2");
        });
        it("should not get a badly formated id", async function() {
            await request.get(`/meal/badId/aliments`).expect(400);
        });
    });
});