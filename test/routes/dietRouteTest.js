const supertest = require("supertest");

require("../rootHooks");

const expect = require('../chaiConfig')
const { app } = require("../../src/app");

const request = supertest(app);

describe("Diet route", function() {
    const fakeDiet = {
        nombre: "FakeDiet",
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
        fakeDiet.idUser = res.body.id;
    });

    describe("POST /diet", function() {
        it("should create a diet", async function() {            
            const res = await request.post("/diet")
                .set("Content-Type", "application/json")
                .send(fakeDiet)
                .expect(201);
            expect(res.body).to.have.property("idElemento");
        });

        it("should not create a diet if parameters are missing", async function() {
            const fakeDiet = { }
            await request.post("/diet")
                .set("Content-Type", "application/json")
                .send(fakeDiet)
                .expect(400);
        });
    });

    describe("DELETE /diet/{id}", async function() {
        it("should delete a diet", async function() {
            const res = await request.post("/diet")
                .set("Content-Type", "application/json")
                .send(fakeDiet);
            const idDiet = res.body.idElemento;
            await request.delete(`/diet/${idDiet}`)
                .expect(200);
        });

        it("should not delete a badly formated id", async function() {
            await request.delete(`/diet/badId`).expect(400);
        });
    });

    describe("PUT /diet/{id}", function() {
        it("should update the given diet", async function() {
            const res = await request.post("/diet")
                .set("Content-Type", "application/json")
                .send(fakeDiet);
            const idDiet = res.body.idElemento;
            
            const newFakeDiet = {
                nombre: "NewFakeName",
                descripcion: "NewFakeDescription"
            }
            await request.put(`/diet/${idDiet}`)
                .set("Content-Type", "application/json")
                .send(newFakeDiet)    
                .expect(200);
        });

        it("should not modify a badly formated id", async function() {
            await request.put(`/diet/badId`).expect(400);
        });
    });

    describe("GET /diet/{id}/dia", function() {
        it("should return an array of meals", async function() {
            let res = await request.post("/diet")
                .set("Content-Type", "application/json")
                .send(fakeDiet);
            const idDiet = res.body.idElemento;

            const newMeal = {
                nombre: "MealTest",
                horaComida: '22:00:00',
                idElemento: idDiet,
                tipoDia: "miercoles",
            };

            const newMeal2 = {
                nombre: "MealTest2",
                horaComida: '20:00:00',
                idElemento: idDiet,
                tipoDia: "miercoles",
            };

            await request.post("/meal")
                .set("Content-Type", "application/json")
                .send(newMeal);

            await request.post("/meal")
                .set("Content-Type", "application/json")
                .send(newMeal2);
            const dia = "miercoles";

            res = await request.get(`/diet/${idDiet}/${dia}`)
                .expect('Content-Type', /json/)
                .expect(200);
            const meals = res.body;
            expect(meals).to.be.an('array');
            expect(meals[0]).to.have.property("horacomida");
            expect(meals[1].nombre).to.equal("MealTest");
            //expect(trainings).to.not.be.empty;
        });
        it("should not get a badly formated id", async function() {
            await request.get(`/diet/badId/badDia`).expect(400);
        });
    });

    describe("GET /diet/{idElemento}/comments", function() {
        it("should return an array of comments", async function() {
            let res = await request.post("/diet")
                .set("Content-Type", "application/json")
                .send(fakeDiet);
            const idDiet = res.body.idElemento;

            const body = {
                idUser: fakeDiet.idUser,
                idElement: idDiet,
                text: 'nice'
            }

            res = await request.post(`/user/comment`)
                .set('Content-Type', 'application/json')
                .send(body)
                .expect(201);
            const idCom = res.body.idCom;

            const body2 = {
                idUser: fakeDiet.idUser,
                idElement: idDiet,
                text: 'nice2'
            }

            res = await request.post(`/user/comment`)
                .set('Content-Type', 'application/json')
                .send(body2)
                .expect(201);
            const idCom2 = res.body.idCom;

            res = await request.get(`/diet/${idDiet}/comments`)
                .expect('Content-Type', /json/)
                .expect(200);

            const comments = res.body;
            console.log(comments);
            expect(comments).to.be.an('array');
            expect(comments[0]).to.have.property("fecha");
            expect(comments[0].idusuario).to.equal(fakeDiet.idUser);
            expect(comments[1].texto).to.equal("nice2");
            //expect(trainings).to.not.be.empty;
        });

        it("should not get a badly formated id", async function() {

            await request.get(`/diet/xd/comments`).expect(400);
        });
    });
});