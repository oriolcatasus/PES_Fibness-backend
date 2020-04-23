const supertest = require("supertest");
const chai = require("chai");

require("../rootHooks");

const { app } = require("../../src/app");

const request = supertest(app);
const expect = chai.expect;
chai.use(require('chai-things'));

describe("user route", function() {
    const fakeUser = {
        nombre: "fakeName",
        email: "fake@example.com",
        password: "fakeHash"
    }
    describe("POST /user", function() {
        it("should create a user", async function() {
            const res = await request.post("/user")
                .set("Accept", "application/json")
                .send(fakeUser)
                .expect('Content-Type', /json/)
                .expect(201);
            const {created, id} = res.body;
            expect(created).to.not.equal(undefined);
            expect(id).to.not.equal(undefined);
        });

        it("should NOT create a user", async function() {            
            const res = await request.post("/user")
                .set("Accept", "application/json")
                .send({ })
                .expect('Content-Type', /json/)
                .expect(400);
            const {created, id} = res.body;
            expect(created).to.not.equal(undefined);
            expect(id).to.equal(undefined);
        });
    });

    describe("DELETE /user/:id", async function() {
        it("should delete a user", async function() {
            const res = await request.post("/user")
                .set("Accept", "application/json")
                .send(fakeUser);
            const id = res.body.id;
            await request.delete(`/user/${id}`).expect(200);
        });

        it("should not delete a nonexistent user", async function() {
            await request.delete(`/user/badId`).expect(500);
        });
    });

    describe("POST /user/validate", function(){
        it("should check if a user is valid", async function() {
            const fakeUserToValidate = {
                email: fakeUser.email,
                password: fakeUser.password
            };
            const res = await request.post(`/user/validate`)
                .set("Accept", "application/json")
                .send(fakeUserToValidate)
                .expect('Content-Type', /json/)
                .expect(200);
            const { result } = res.body;
            expect(result).not.equal(undefined);
        });
    });

    describe("GET /user/:id/trainings", function() {
        it.skip("should return an array of trainings", async function() {
            let res = await request.post("/user")
                .set("Accept", "application/json")
                .send(fakeUser);
            const idUser = res.body.id;
            res = await request.get(`/user/${idUser}/trainings`)
                .expect('Content-Type', /json/)
                .expect(200);
            const trainings = res.body;
            expect(trainings).to.be.an('array');
            //expect(trainings).to.not.be.empty;
        });
    });

    describe("POST /user/resetPassword", function(){
        it("should reset the password of a user", async function() {
            await request.post(`/user`)
                .set("Accept", "application/json")
                .send(fakeUser)

            const newPassword = {
                email: fakeUser.email,
                password: "newFakeHash"
            };

            await request.put(`/user/resetPassword`)
                .send(newPassword)
                .expect(200);
        });
    });

    describe("GET /user/:id/info", function(){
        it("should return the information of a user", async function() {
            let res = await request.post("/user")
                .set("Accept", "application/json")
                .send(fakeUser);
            const idUser = res.body.id;

            res = await request.get(`/user/${idUser}/info`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(res.body).to.have.property("nombre");
            expect(res.body).to.have.property("email");
            expect(res.body).to.have.property("tipousuario");
            expect(res.body).to.have.property("tipoperfil");
            expect(res.body).to.have.property("genero");
            expect(res.body).to.have.property("descripcion");
            expect(res.body).to.have.property("fechadenacimiento");
            expect(res.body).to.have.property("fechaderegistro");
            expect(res.body).to.have.property("pais");
            expect(res.body).to.have.property("rutaimagen");
            expect(res.body).to.have.property("nseguidores");
            expect(res.body).to.have.property("nseguidos");
            expect(res.body).to.have.property("npost");
        });
    });

    describe("PUT /user/:id/info", function(){
        it("should update the settings of a user", async function() {
            let res = await request.post("/user")
                .set("Accept", "application/json")
                .send(fakeUser);
            const idUser = res.body.id;
            const newFakeSettings = {
                sEdad: false,
                sDistancia: true,
                sInvitacion: false,
                sSeguidor: false,
                nMensaje: true,
            }

            res = await request.put(`/user/${idUser}/settings`)
                .send(newFakeSettings)
                .expect(200);
        });
    });

    describe("GET /user/:id/settings", function(){
        it("should return the settings of a user", async function() {
            let res = await request.post("/user")
                .set("Accept", "application/json")
                .send(fakeUser);
            const idUser = res.body.id;

            res = await request.get(`/user/${idUser}/settings`)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(res.body).to.have.property("sedad");
            expect(res.body).to.have.property("sdistancia");
            expect(res.body).to.have.property("sinvitacion");
            expect(res.body).to.have.property("sseguidor");
            expect(res.body).to.have.property("nmensaje");
        });
    });

    describe(`POST /user/fb`, function() {
        it(`should login a new user with fb`, async function(){
            const res = await request.post(`/user/fb`)
                .set(`Accept`, `application/json`)
                .send(fakeUser)
                .expect(201);
            expect(res.body).to.have.property(`id`);
        });
        
        it(`should login an existent user with fb`, async function() {
            await request.post(`/user/fb`)
                .set(`Accept`, `application/json`)
                .send(fakeUser);
            const res = await request.post(`/user/fb`)
                .set(`Accept`, `application/json`)
                .send(fakeUser)
                .expect(200);
            expect(res.body).to.have.property(`id`);
        });
    });
});