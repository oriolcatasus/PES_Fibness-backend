const supertest = require("supertest");
const chai = require("chai");

require("../rootHooks");

const { app } = require("../../src/app");

const request = supertest(app);
const expect = chai.expect;
chai.use(require('chai-things'));

describe("user route", function() {
    describe("POST /user", function() {
        it("should create a user", async function() {
            const fakeUser = {
                nombre: "fakeName",
                email: "fake@example.com",
                password: "fakeHash"
            }
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
            const fakeUser = { }
            const res = await request.post("/user")
                .set("Accept", "application/json")
                .send(fakeUser)
                .expect('Content-Type', /json/)
                .expect(400);
            const {created, id} = res.body;
            expect(created).to.not.equal(undefined);
            expect(id).to.equal(undefined);
        });
    });

    describe("DELETE /user/:id", async function() {
        it("should delete a user", async function() {
            const fakeUser = {
                nombre: "fakeName",
                email: "fake@example.com",
                password: "fakeHash"
            };
            const res = await request.post("/user")
                .set("Accept", "application/json")
                .send(fakeUser);
            const id = res.body.id;
            await request.delete(`/user/${id}`).expect(200);
        });

        it("should not delete a nonexistent user", async function() {
            await request.delete(`/user/badId`).expect(400);
        });
    });

    describe("POST /user/validate", function(){
        it("should check if a user is valid", async function() {
            const fakeUser = {
                email: "fake@example.com",
                password: "fakeHash"
            };
            const res = await request.post(`/user/validate`)
                .set("Accept", "application/json")
                .send(fakeUser)
                .expect('Content-Type', /json/)
                .expect(200);
            const { result } = res.body;
            expect(result).not.equal(undefined);
        });
    });

    describe("GET /user/:id/trainings", function() {
        it.skip("should return an array of trainings", async function() {
            const fakeUser = {
                nombre: "fakeName",
                email: "fake@example.com",
                password: "fakeHash"
            }
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
});