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
    describe("POST /user", function() {
        it("should create a user", async function() {
            const res = await request.post("/user")
                .set("Content-Type", "application/json")
                .send(fakeUser)
                .expect('Content-Type', /json/)
                .expect(201);
            const {created, id} = res.body;
            expect(created).to.not.equal(undefined);
            expect(id).to.not.equal(undefined);
        });

        it("should NOT create a user", async function() {            
            const res = await request.post("/user")
                .set("Content-Type", "application/json")
                .send({ })
                .expect('Content-Type', /json/)
                .expect(400);
            const {created, id} = res.body;
            expect(created).to.not.equal(undefined);
            expect(id).to.equal(undefined);
        });

        it("should not create a user if parameters are missing", async function() {
            const fakeUser = { }
            await request.post("/user")
                .set("Content-Type", "application/json")
                .send(fakeUser)
                .expect(400);
        });
    });

    describe("DELETE /user/:id", async function() {
        it("should delete a user", async function() {
            const res = await request.post("/user")
                .set("Content-Type", "application/json")
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
                .set("Content-Type", "application/json")
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
                .set("Content-Type", "application/json")
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
                .set("Content-Type", "application/json")
                .send(fakeUser)

            const newPassword = {
                email: fakeUser.email,
                password: "newFakeHash"
            };

            const res = await request.put(`/user/resetPassword`)
                .send(newPassword)
                .expect(200);
            expect(res.body.result).to.equal(true);
        });

        it("should not reset the password of a nonexistent user", async function() {
            const newPassword = {
                email: fakeUser.email,
                password: "newFakeHash"
            };

            const res = await request.put(`/user/resetPassword`)
                .send(newPassword)
                .expect(200);
            expect(res.body.result).to.equal(false);
        });
    });

    describe("GET /user/:id/info", function(){
        it("should return the information of a user", async function() {
            let res = await request.post("/user")
                .set("Content-Type", "application/json")
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

        it("should not return info for a nonexistent user", async function() {
            await request.get(`/user/badId/info`).expect(400);
        });
    });

    describe(`PUT /user/:id/info`, function() {
        it(`should modify a user`, async function() {
            const res = await request.post(`/user`)
                .set(`Content-Type`, `application/json`)
                .send(fakeUser);
            const idUser = res.body.id;

            const newFakeInfo = {
                nombre: `FakeName`,
                genero: false,
                descripcion: `Fake description`,
                fechadenacimiento: `2017-05-29`,
                pais: 23
            }
            await request.put(`/user/${idUser}/info`)
                .set(`Content-Type`, `application/json`)
                .send(newFakeInfo)
                .expect(200);
        });

        it("should not modify info for a nonexistent user", async function() {
            await request.put(`/user/badId/info`).expect(400);
        });
    });

    describe('GET /user/:id/settings', function(){
        it('should return the settings of a user', async function() {
            let res = await request.post('/user')
                .set('Content-Type', 'application/json')
                .send(fakeUser);
            const idUser = res.body.id;

            res = await request.get(`/user/${idUser}/settings`)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(res.body).to.have.property('sedad');
            expect(res.body).to.have.property('sdistancia');
            expect(res.body).to.have.property('sinvitacion');
            expect(res.body).to.have.property('sseguidor');
            expect(res.body).to.have.property('nmensaje');
        });

        it('should not get settings for a nonexistent user', async function() {
            await request.get('/user/badId/settings').expect(400);
        });
    });

    describe('PUT /user/:id/settings', function(){
        it('should update the settings of a user', async function() {
            let res = await request.post('/user')
                .set('Content-Type', 'application/json')
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

        it('should not modify settings for a nonexistent user', async function() {
            await request.put('/user/badId/settings').expect(400);
        });
    });
    
    describe('POST /user/fb', function() {
        it('should login a new user with fb', async function(){
            const res = await request.post('/user/fb')
                .set('Content-Type', 'application/json')
                .send(fakeUser)
                .expect(201);
            expect(res.body).to.have.property('id');
        });
        
        it('should login an existent user with fb', async function() {
            await request.post('/user/fb')
                .set('Content-Type', 'application/json')
                .send(fakeUser);
            const res = await request.post('/user/fb')
                .set('Content-Type', 'application/json')
                .send(fakeUser)
                .expect(200);
            expect(res.body).to.have.property('id');
        });
    });

    describe('POST /user/:id/profile', function() {
        it('should set a new profile image', async function() {
            const res = await request.post('/user')
                .set('Content-Type', 'application/json')
                .send(fakeUser)
            const id = res.body.id
            const pathImg = path.join(userTestResourcePath, 'profile.jpg')
            const img = await fs.readFile(pathImg)
            await request.post(`/user/${id}/profile`)
                .set('Content-Type', 'image/jpeg')
                .send(img)
                .expect(201)

            const pathUser = path.join(userResourcePath, `${id}`)
            fs.rmdir(pathUser, {recursive: true})
        })

        it('should not set a new profile image for a nonexistant user', async function() {
            const id = 0;
            const pathImg = path.join(userTestResourcePath, 'profile.jpg')
            const img = await fs.readFile(pathImg)
            await request.post(`/user/${id}/profile`)
                .set('Content-Type', 'image/jpeg')
                .send(img)
                .expect(500)
        })
    })

    describe('GET /user/:id/profile', function() {
        it('should get the profile image', async function() {
            const res = await request.post('/user')
                .set('Content-Type', 'application/json')
                .send(fakeUser)
            const id = res.body.id
            const pathImg = path.join(userTestResourcePath, 'profile.jpg')
            const img = await fs.readFile(pathImg, {encoding: constants.encoding})
            await request.post(`/user/${id}/profile`)
                .set('Content-Type', 'image/jpeg')
                .send(img)

            const response = await request.get(`/user/${id}/profile`).expect(200)
            expect(response.text).to.equal(img)

            const pathUser = path.join(userResourcePath, `${id}`)
            fs.rmdir(pathUser, {recursive: true})
        })

        it("should not get the profile image if the user doesn't exist", async function() {
            const id = 0
            await request.get(`/user/${id}/profile`)
                .expect(500)
        })
    })

    describe('POST /user/follow', function() {
        it('should add a follower', async function() {
            let res = await request.post('/user')
                .set('Content-Type', 'application/json')
                .send(fakeUser)
            const id = res.body.id

            const fakeUser2 = {
                nombre: "fakeName2",
                email: "fake2@example.com",
                password: "fakeHash2"
            }

            res = await request.post('/user')
                .set('Content-Type', 'application/json')
                .send(fakeUser2)
            const id2 = res.body.id;

            const body = {
                idFollower: id,
                idFollowed: id2
            }

            await request.post(`/user/follow`)
                .set('Content-Type', 'application/json')
                .send(body)
                .expect(201);
        })

        it("should not add a follower if it does not exist", async function() {

            const body = {
                idFollower: 'fakeID',
                idFollowed: 'fakeID2'
            }

            await request.post(`/user/follow`)
                .set('Content-Type', 'application/json')
                .expect(400);
        })
    })

    describe('DELETE /user/follow/:idFollower/:idFollowed', function() {
        it('should delete a follower', async function() {
            let res = await request.post('/user')
                .set('Content-Type', 'application/json')
                .send(fakeUser)
            const id = res.body.id

            const fakeUser2 = {
                nombre: "fakeName2",
                email: "fake2@example.com",
                password: "fakeHash2"
            }

            res = await request.post('/user')
                .set('Content-Type', 'application/json')
                .send(fakeUser2)
            const id2 = res.body.id

            const idFollower = id;
            const idFollowed = id2;
            

            await request.delete(`/user/follow/${idFollower}/${idFollowed}`)
                .set('Content-Type', 'application/json')
                .expect(200);
        })

        it("should not delete a follower if it does not exist", async function() {
            const idFollower = 'fakeID';
            const idFollowed = 'fakeID2';

            await request.delete(`/user/follow/${idFollower}/${idFollowed}`)
                .set('Content-Type', 'application/json')
                .expect(400);
        })
    })

    describe('GET /user/:id/followers', function() {
        it('should get the followers of a user', async function() {
            let res = await request.post('/user')
                .set('Content-Type', 'application/json')
                .send(fakeUser)
            const id = res.body.id

            const fakeUser2 = {
                nombre: "fakeName2",
                email: "fake2@example.com",
                password: "fakeHash2"
            }

            res = await request.post('/user')
                .set('Content-Type', 'application/json')
                .send(fakeUser2)
            const id2 = res.body.id

            const body = {
                idFollower: id,
                idFollowed: id2
            }

            await request.post(`/user/follow`)
                .set('Content-Type', 'application/json')
                .send(body)
                .expect(201);

            res = await request.get(`/user/${id2}/followers`)
                .expect('Content-Type', /json/)
                .expect(200);

            const followers = res.body;
            expect(followers).to.be.an('array');
        })

        it("should not get the followers of a user if it does not exist", async function() {

            await request.get('/user/fakeid/followers')
                .set('Content-Type', 'application/json')
                .expect(400);
        })
    })

    describe('GET /user/:id/followed', function() {
        it('should get the people followed by a user', async function() {
            let res = await request.post('/user')
                .set('Content-Type', 'application/json')
                .send(fakeUser)
            const id = res.body.id

            const fakeUser2 = {
                nombre: "fakeName2",
                email: "fake2@example.com",
                password: "fakeHash2"
            }

            res = await request.post('/user')
                .set('Content-Type', 'application/json')
                .send(fakeUser2)
            const id2 = res.body.id

            const body = {
                idFollower: id,
                idFollowed: id2
            }

            await request.post(`/user/follow`)
                .set('Content-Type', 'application/json')
                .send(body)
                .expect(201);

            res = await request.get(`/user/${id}/followed`)
                .expect('Content-Type', /json/)
                .expect(200);

            const followed = res.body;
            expect(followed).to.be.an('array');
        })

        it("should not get the followed people by a user if it does not exist", async function() {

            await request.get('/user/fakeid/followed')
                .set('Content-Type', 'application/json')
                .expect(400);
        })
    })

    describe('GET /user/shortInfo/:currentID', function() {
        it('should get the info of all users except one', async function() {
            let res = await request.post('/user')
                .set('Content-Type', 'application/json')
                .send(fakeUser)
            const id = res.body.id

            const fakeUser2 = {
                nombre: "fakeName2",
                email: "fake2@example.com",
                password: "fakeHash2"
            }

            res = await request.post('/user')
                .set('Content-Type', 'application/json')
                .send(fakeUser2)
            const id2 = res.body.id

            res = await request.get(`/user/shortInfo/${id2}`)
                .expect('Content-Type', /json/)
                .expect(200);
            const usersInfo = res.body;
            expect(usersInfo).to.be.an('array');
        })
    })

    describe('POST /user/block', function() {
        it('should block a user', async function() {
            let res = await request.post('/user')
                .set('Content-Type', 'application/json')
                .send(fakeUser)
            const id = res.body.id

            const fakeUser2 = {
                nombre: "fakeName2",
                email: "fake2@example.com",
                password: "fakeHash2"
            }

            res = await request.post('/user')
                .set('Content-Type', 'application/json')
                .send(fakeUser2)
            const id2 = res.body.id

            const body = {
                idBlocker: id,
                idBlocked: id2
            }

            res = await request.post(`/user/block`)
                .set('Content-Type', 'application/json')
                .send(body)
                .expect(201);
        })

        it("should not block somebody if it does not exist", async function() {

            const body = {
                idFollower: 'fakeID',
                idFollowed: 'fakeID2'
            }

            await request.post(`/user/block`)
                .set('Content-Type', 'application/json')
                .expect(400);
        })
    })

    describe('DELETE /user/block/:idBlocker/:idBlocked', function() {
        it('should unblock a user', async function() {
            let res = await request.post('/user')
                .set('Content-Type', 'application/json')
                .send(fakeUser)
            const id = res.body.id

            const fakeUser2 = {
                nombre: "fakeName2",
                email: "fake2@example.com",
                password: "fakeHash2"
            }
            res = await request.post('/user')
                .set('Content-Type', 'application/json')
                .send(fakeUser2)
            const id2 = res.body.id

            const idBloquer = id;
            const idBloqued = id2;
            

            await request.delete(`/user/block/${idBloquer}/${idBloqued}`)
                .set('Content-Type', 'application/json')
                .expect(200);
        })

        it("should not unblock a user if it does not exist", async function() {
            const idBloquer = 'fakeID';
            const idBloqued = 'fakeID2';

            await request.delete(`/user/block/${idBloquer}/${idBloqued}`)
                .set('Content-Type', 'application/json')
                .expect(400);
        })
    })
    describe('GET /user/:id/info/:id2', function() {
        it('should get the information of a user', async function() {
            let res = await request.post('/user')
                .set('Content-Type', 'application/json')
                .send(fakeUser)
            const id = res.body.id

            const fakeUser2 = {
                nombre: "fakeName2",
                email: "fake2@example.com",
                password: "fakeHash2"
            }
            res = await request.post('/user')
                .set('Content-Type', 'application/json')
                .send(fakeUser2)
            const id2 = res.body.id

            const info = await request.get(`/user/${id}/info/${id2}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(info.body).to.have.property('seguir');
            expect(info.body).to.have.property('id');
            expect(info.body).to.have.property('nmensaje');
            expect(info.body).to.have.property('descripcion');
            
        })

        it("should not get the info of a user if it does not exist", async function() {

            await request.get(`/user/fakeID/info/fakeID`)
                .set('Content-Type', 'application/json')
                .expect(400);
        })
    })
});