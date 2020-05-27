const path = require('path')
const fs = require('fs').promises

const supertest = require("supertest")

require("../rootHooks")

const expect = require('../chaiConfig')
const { app } = require("../../src/app")

const testConstants = require('../constants')
const constants = require('../../src/constants')

const userTestResourcePath = path.join(testConstants.resourcePath, 'user')
const userResourcePath = path.join(constants.resourcePath, 'user')
const request = supertest(app)

describe("user route", function() {
    const fakeUser = {
        nombre: "fakeName",
        email: "fake@example.com",
        password: "fakeHash"
    }

    describe("GET /{idElemento}/comments", function() {
        it("should return an array of comments", async function() {
            const fakeDiet = {
                nombre: "FakeDiet",
                descripcion: "FakeDescription",
                idUser: undefined
            }

            const fakeUser = {
                nombre: "fakeName",
                email: "fake@example.com",
                password: "fakeHash"
            }

            let res = await request.post("/user")
                .set("Content-Type", "application/json")
                .send(fakeUser)
            fakeDiet.idUser = res.body.id;

            res = await request.post("/diet")
                .set("Content-Type", "application/json")
                .send(fakeDiet);
            const idDiet = res.body.idElemento;

            const body = {
                idUser: fakeDiet.idUser,
                idElement: idDiet,
                text: 'nice'
            }

            res = await request.post(`/comment`)
                .set('Content-Type', 'application/json')
                .send(body)
                .expect(201);
            const idCom = res.body.idCom;

            const body2 = {
                idUser: fakeDiet.idUser,
                idElement: idDiet,
                text: 'nice2'
            }

            res = await request.post(`/comment`)
                .set('Content-Type', 'application/json')
                .send(body2)
                .expect(201);
            const idCom2 = res.body.idCom;

            res = await request.get(`/comment/${idDiet}/comments`)
                .expect('Content-Type', /json/)
                .expect(200);

            const comments = res.body;
            expect(comments).to.be.an('array');
            expect(comments[0]).to.have.property("fecha");
            expect(comments[0].idusuario).to.equal(fakeDiet.idUser);
            expect(comments[1].texto).to.equal("nice2");
            //expect(trainings).to.not.be.empty;
        });

        it("should not get a badly formated id", async function() {

            await request.get(`/diet/comments/xd`).expect(400);
        });
    });





});