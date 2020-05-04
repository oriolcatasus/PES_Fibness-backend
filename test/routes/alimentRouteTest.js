const supertest = require("supertest");

require("../rootHooks");

const expect = require('../chaiConfig')
const { app } = require("../../src/app");

const request = supertest(app);


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

        const meal = {
            nombre: "MealTest",
            horaComida: '22:00:00',
            idElemento: undefined,
            tipoDia: "miercoles",
        };

        let res = await request.post("/user")
            .set("Content-Type", "application/json")
            .send(user)
        diet.idUser = res.body.id;

        res = await request.post("/diet")
            .set("Content-Type", "application/json")
            .send(diet)
        meal.idElemento = res.body.idelemento;

        res = await request.post("/meal")
            .set("Content-Type", "application/json")
            .send(meal)
        aliment.idComida = res.body.idcomida;
    });

    describe("POST /aliment", function() {
        it("should create an aliment", async function() {            
            const res = await request.post("/aliment")
                .set("Content-Type", "application/json")
                .send(aliment)
                .expect(201);
            expect(res.body).to.have.property("idAlimento");
        });

        it("should not create an aliment if parameters are wrong", async function() {
            const fakeAliment = { 
                idComida: -1,
            };
            await request.post("/aliment")
                .set("Content-Type", "application/json")
                .send(fakeAliment)
                .expect(400);
        });
    });

    describe("DELETE /aliment/{id}", async function() {
        it("should delete an aliment", async function() {
            const res = await request.post("/aliment")
                .set("Content-Type", "application/json")
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
                .set("Content-Type", "application/json")
                .send(aliment);
            const idAliment = res.body.idAlimento;
            
            let newAliment = {
                nombre: "AlimentTest2",
                descripcion: "descriptionTest2",
                calorias: '500',
            };
            await request.put(`/aliment/${idAliment}`)
                .set("Content-Type", "application/json")
                .send(newAliment)    
                .expect(200);
        });

        it("should not modify a badly formated id", async function() {
            await request.put(`/aliment/badId`).expect(400);
        });
    });
});