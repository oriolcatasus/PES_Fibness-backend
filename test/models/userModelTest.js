const assert = require("assert");
const path = require('path')
const fs = require('fs').promises

const user = require("../../src/models/userModel");
const training = require("../../src/models/trainingModel");
const diet = require("../../src/models/dietModel")
const route = require("../../src/models/routeModel");
const dbCtrl = require("../../src/ctrls/dbCtrl");

const testConstants = require('../constants')
const constants = require('../../src/constants')
const expect = require('../chaiConfig')

const userTestResourcePath = path.join(testConstants.resourcePath, 'user')
const userResourcePath = path.join(constants.resourcePath, 'user')

//require("../rootHooks");

describe("userModel script", function() {
    describe("create function", function() {
        it("should return user created correctly", async function() {
            const fakeUser = {
                nombre: "Fake",
                password: "fakeHash",
                email: "fake@example.com",
            }
            const creation = await user.create(fakeUser);

            const userdb = await user.getByEmail(fakeUser.email)
            assert.strictEqual(creation.created, true);
            assert.strictEqual(creation.id, userdb.id);
            assert.strictEqual(creation.error, undefined);
            assert.strictEqual(fakeUser.nombre, userdb.nombre);
            assert.strictEqual(fakeUser.password, userdb.password);
            assert.strictEqual(fakeUser.email, userdb.email);
        });

        it("should NOT create a new user when email already exists", async function() {
            const fakeUser1 = {
                nombre: "Fake",
                password: "fakeHash",
                email: "fake@example.com",
            }
            const creation1 = await user.create(fakeUser1);
            const fakeUser2 = {
                nombre: "Fake2",
                password: "fakeHash2",
                email: "fake@example.com",
            }
            const creation2 = await user.create(fakeUser2);

            assert.strictEqual(creation1.created, true);
            assert.strictEqual(creation2.created, false);
            assert.strictEqual(creation2.id, undefined);
            assert.notStrictEqual(creation2.error, undefined);  
        });

        it("should NOT create a new user when password isn't provided", async function() {
            const fakeUser = {
                nombre: "Fake",
                email: "fake@example.com",
            }
            const creation = await user.create(fakeUser);

            assert.strictEqual(creation.created, false);
            assert.strictEqual(creation.id, undefined);
            assert.notStrictEqual(creation.error, undefined);            
        });
    });

    describe('getById(id)', function() {
        it('should return the user with the given id', async function() {
            const fakeUser = {
                nombre: 'Fake',
                email: 'fake@example.com',
                password: 'fakeHash'
            }
            const res = await user.create(fakeUser)
            const userRetrieved = await user.getById(res.id)
            
            expect(fakeUser.nombre).to.equal(userRetrieved.nombre)
            expect(fakeUser.email).to.equal(userRetrieved.email)
            expect(fakeUser.password).to.equal(userRetrieved.password)
        })
    })

    describe('getByEmail(email)', function() {
        it('should return the user with the given email', async function() {
            const fakeUser = {
                nombre: 'Fake',
                email: 'fake@example.com',
                password: 'fakeHash'
            }
            await user.create(fakeUser)
            const userRetrieved = await user.getByEmail(fakeUser.email)
            
            expect(fakeUser.nombre).to.equal(userRetrieved.nombre)
            expect(fakeUser.email).to.equal(userRetrieved.email)
            expect(fakeUser.password).to.equal(userRetrieved.password)
        })
    })

    describe('delete user', function() {        
        it ('should return deleted correctly', async function() {
            const fakeUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }            
            const userCreated = await user.create(fakeUser)
            const id = userCreated.id
            const userPath = path.join(constants.resourcePath, 'user', `${id}`)
            const userPathProfile = path.join(userPath, 'profile')
            await fs.mkdir(userPathProfile, {recursive: true})
            await user.del(id)

            const userRetrieved = await user.getById(id);
            expect(userRetrieved).to.be.undefined
            await expect(fs.access(userPath)).to.eventually.be.rejected
        });
    });

    describe("validate", function() {

        const fakeUser = {
            nombre: "FakeName",
            password: "fakeHash",
            email: "fake@example.com",
        };

        it("should validate email & password", async function(){
            await user.create(fakeUser);
            const validation = await user.validate({
                email: fakeUser.email,
                password: fakeUser.password
            });

            const userDb = await user.getByEmail(fakeUser.email);
            assert.strictEqual(validation.result, true);
            assert.strictEqual(validation.id, userDb.id);
        });

        it("should NOT validate email & password", async function() {
            await user.create(fakeUser);
            const validation = await user.validate({
                email: "another@example.com",
                password: "anotherHash"
            });

            assert.strictEqual(validation.result, false);
            assert.strictEqual(validation.id, undefined);
        });

        it("should NOT validate just email", async function() {
            await user.create(fakeUser);
            const validation = await user.validate({
                email: fakeUser.email
            });

            assert.strictEqual(validation.result, false);
            assert.strictEqual(validation.id, undefined);
        });

        it("should NOT validate just password", async function() {
            await user.create(fakeUser);
            const validation = await user.validate({
                password: fakeUser.password
            });

            assert.strictEqual(validation.result, false);
            assert.strictEqual(validation.id, undefined);
        });
    });
    describe("get operation", function() {
        it("should return set of routes correctly", async function(){
            //create user
            const fakeUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            const res = await user.create(fakeUser);
            idUser = res.id;
            console.log("the id is:") 
            console.log(idUser)
            //create route 1 (and element)
            console.log("--------------------------------------------------------")
            const newRoute = {
                nombre: "RouteTest",
                descripcion: "RouteDescription",
                origen: "CoordenateOrigin",
                destino: "CoordenateDestine",
                idUser: idUser,
            }
            console.log("0--------------------------------------------------------")
            await route.create(newRoute);
            console.log("1--------------------------------------------------------")

            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newRoute.nombre, idUser],
            };
            console.log("2--------------------------------------------------------")

            res2 = (await dbCtrl.execute(queryGetID)).rows[0];
            console.log("3--------------------------------------------------------")
            idElem1 = res2.idelemento;
            console.log("4--------------------------------------------------------")
            console.log("ruta1:")
            console.log(idElem1);
            //create route 2 (and element)
            const newRoute2 = {
                nombre: "RouteTest2",
                descripcion: "RouteDescription",
                origen: "CoordenateOrigin",
                destino: "CoordenateDestine",
                idUser: idUser,
            }
            console.log("5--------------------------------------------------------")
            await route.create(newRoute2);
            console.log("6--------------------------------------------------------")

            let queryGetID2 = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newRoute2.nombre, idUser],
            };
            res3 = (await dbCtrl.execute(queryGetID2)).rows[0];
            idElem2 = res3.idelemento;
            console.log("ruta2:")
            console.log(idElem2)

            const routeSet = await user.routes(idUser);

            console.log("hello------------------------------");
            console.log(routeSet);
            assert.equal(routeSet[0].nombre, newRoute.nombre);
            assert.equal(routeSet[0].descripcion, newRoute.descripcion);
            assert.equal(routeSet[0].origen, newRoute.origen);
            assert.equal(routeSet[0].destino, newRoute.destino);
            assert.equal(routeSet[1].nombre, newRoute2.nombre);
            assert.equal(routeSet[1].descripcion, newRoute2.descripcion);
            assert.equal(routeSet[1].origen, newRoute2.origen);
            assert.equal(routeSet[1].destino, newRoute2.destino);
        });
        it("should NOT return routes from other users", async function(){

            //create user
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);

            //create user 2
            let newUser2 = {
                nombre: "Oriol2",
                password: "hash",
                email: "oriol2@example.com",
            }
            await user.create(newUser2);

             //select id from user 1 in order to test that nothing is returned
            let query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let res = (await dbCtrl.execute(query)).rows[0];
            idUser = res.id; 

            //select id from user 2 in order to create a training (we need it for the foreign key of element)
            query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol2"],
            };
            res = (await dbCtrl.execute(query)).rows[0];
            idUser2 = res.id; 

            //create training for user2 (and element)
            let newTraining = {
                nombre: "RouteTest",
                descripcion: "RouteDescription",
                origen: "CoordenateOrigin",
                destino: "CoordenateDestine",
                idUser: idUser2,
            }
            await training.create(newTraining);


            //getting trainings of user1 and making sure there is none
            let trainingSet = await user.routes(idUser);
            assert.equal(trainingSet.length, 0);
        });


        it("should return set of trainings correctly", async function(){
            //create user
            const fakeUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            const res = await user.create(fakeUser);
            idUser = res.id; 

            //create training 1 (and element)
            const newTraining = {
                nombre: "TrainingTest",
                descripcion: "TrainingDescription",
                idUser,
            }
            await training.create(newTraining);

            //create training 2 (and element)
            const newTraining2 = {
                nombre: "TrainingTest2",
                descripcion: "TrainingDescription",
                idUser,
            }
            await training.create(newTraining2);

            const trainingSet = await user.trainings(idUser);

            assert.equal(trainingSet[0].nombre, newTraining.nombre);
            assert.equal(trainingSet[0].descripcion, newTraining.descripcion);
            assert.equal(trainingSet[1].nombre, newTraining2.nombre);
            assert.equal(trainingSet[1].descripcion, newTraining2.descripcion);
        });

        it("should NOT return trainings from other users", async function(){

            //create user
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);

            //create user 2
            let newUser2 = {
                nombre: "Oriol2",
                password: "hash",
                email: "oriol2@example.com",
            }
            await user.create(newUser2);

             //select id from user 1 in order to test that nothing is returned
            let query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let res = (await dbCtrl.execute(query)).rows[0];
            idUser = res.id; 

            //select id from user 2 in order to create a training (we need it for the foreign key of element)
            query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol2"],
            };
            res = (await dbCtrl.execute(query)).rows[0];
            idUser2 = res.id; 

            //create training for user2 (and element)
            let newTraining = {
                nombre: "TrainingTest",
                descripcion: "TrainingDescription",
                idUser: idUser2,
            }
            await training.create(newTraining);


            //getting trainings of user1 and making sure there is none
            let trainingSet = await user.trainings(idUser);
            assert.equal(trainingSet.length, 0);

        });

        it("should NOT return other things (diets) both from the same user and others", async function() {
            //create user
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);

            //create user 2
            let newUser2 = {
                nombre: "Oriol2",
                password: "hash",
                email: "oriol2@example.com",
            }
            await user.create(newUser2);

             //select id from user 1 in order to create diet1
             let query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let res = (await dbCtrl.execute(query)).rows[0];
            idUser = res.id; 

            //select id from user 2 in order to create diet2
            query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol2"],
            };
            res = (await dbCtrl.execute(query)).rows[0];
            idUser2 = res.id; 

            //create diet for user1
            let newDiet = {
                nombre: "DietTest",
                descripcion: "DietDescription",
                idUser: idUser,
            }
            await diet.create(newDiet);

            //create diet for user2
            let newDiet2 = {
                nombre: "DietTest2",
                descripcion: "DietDescription",
                idUser: idUser2,
            }
            await diet.create(newDiet2);

            //getting trainings of user1 and making sure there is none
            let trainingSet = await user.trainings(idUser);
            assert.equal(trainingSet.length, 0);
        });

        it("should return set of diets correctly", async function(){
            //create user
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);

            //select id from user in order to create a diet (we need it for the foreign key of element)
            let query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let res = (await dbCtrl.execute(query)).rows[0];
            idTest = res.id; 

            //create diet 1 (and element)
            let newDiet = {
                nombre: "DietTest",
                descripcion: "DietDescription",
                idUser: idTest,
            }
            await diet.create(newDiet);

            //create diet 2 (and element)
            let newDiet2 = {
                nombre: "DietTest2",
                descripcion: "DietDescription",
                idUser: idTest,
            }
            await diet.create(newDiet2);

            let dietSet = await user.diets(idTest);

            assert.equal(dietSet[0].nombre, newDiet.nombre);
            assert.equal(dietSet[0].descripcion, newDiet.descripcion);
            assert.equal(dietSet[1].nombre, newDiet2.nombre);
            assert.equal(dietSet[1].descripcion, newDiet2.descripcion);
        });

        it("should NOT return diets from other users", async function(){

            //create user
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);

            //create user 2
            let newUser2 = {
                nombre: "Oriol2",
                password: "hash",
                email: "oriol2@example.com",
            }
            await user.create(newUser2);

             //select id from user 1 in order to test that nothing is returned
            let query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let res = (await dbCtrl.execute(query)).rows[0];
            idUser = res.id; 

            //select id from user 2 in order to create a diet (we need it for the foreign key of element)
            query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol2"],
            };
            res = (await dbCtrl.execute(query)).rows[0];
            idUser2 = res.id; 

            //create diet for user2 (and element)
            let newDiet = {
                nombre: "DietTest",
                descripcion: "DietDescription",
                idUser: idUser2,
            }
            await diet.create(newDiet);


            //getting diets of user1 and making sure there is none
            let dietSet = await user.diets(idUser);
            assert.equal(dietSet.length, 0);

        });

        it("should NOT return other things (trainings) both from the same user and others", async function() {
            //create user
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);

            //create user 2
            let newUser2 = {
                nombre: "Oriol2",
                password: "hash",
                email: "oriol2@example.com",
            }
            await user.create(newUser2);

             //select id from user 1 in order to create training1
             let query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let res = (await dbCtrl.execute(query)).rows[0];
            idUser = res.id; 

            //select id from user 2 in order to create training2
            query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol2"],
            };
            res = (await dbCtrl.execute(query)).rows[0];
            idUser2 = res.id; 

            //create training for user1
            let newDiet = {
                nombre: "TrainingTest",
                descripcion: "TrainingDescription",
                idUser: idUser,
            }
            await training.create(newDiet);

            let newDietTrue = {
                nombre: "TrainingTest11",
                descripcion: "TrainingDescription",
                idUser: idUser2,
            }
            await diet.create(newDietTrue);

            //create training for user2
            let newDiet2 = {
                nombre: "TrainingTest2",
                descripcion: "TrainingDescription",
                idUser: idUser2,
            }
            await training.create(newDiet2);

            //getting trainings of user1 and making sure there is none
            let dietSet = await user.diets(idUser);
            assert.equal(dietSet.length, 0);
        });
    });

    describe("reset password operation", function() {
        it("should reset password successfully", async function() {
            //create user
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);

            //Reset the password
            let newPassword = {
                email: "oriol@example.com",
                password: "newHash",
            }
            await user.resetPassword(newPassword);

            //make sure it has been reseted
            query = {
                text: "SELECT password \
                        FROM usuarios \
                        WHERE email = $1",
                values: [newUser.email],
            };
            let pass = (await dbCtrl.execute(query)).rows[0].password;
            assert.equal(pass, newPassword.password);
        });
    });

    describe("get user info operation", function() {
        it("should return user info successfully", async function() {
            //create user
            const fakeUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            const idUser = (await user.create(fakeUser)).id;
            const info = (await user.getInfo(idUser));
            //const todayDate = new Date(Date.now()).toDateString();
            expect(info.nombre).to.equal(fakeUser.nombre);
            expect(info.email).to.equal(fakeUser.email);
            expect(info.tipousuario).to.equal(`principiante`);
            expect(info.tipoperfil).to.equal(`publico`);
            expect(info.genero).to.equal(null);
            expect(info.descripcion).to.equal(null);
            expect(info.fechadenacimiento).to.equal(null);
            //expect(info.fechaderegistro).to.equal(todayDate);
            expect(info.pais).to.equal(null);            
            expect(info.rutaimagen).to.equal(null);
            expect(info.nseguidores).to.equal(0);
            expect(info.nseguidos).to.equal(0);
            expect(info.npost).to.equal(0);
        });
    });

    describe(`putInfo`, function() {
        it(`should successfully update user info`, async function() {
            const fakeUser = {
                nombre: `FakeName`,
                password: `fakeHash`,
                email: `fake@example.com`,
            };
            const idUser = (await user.create(fakeUser)).id;
            const newFakeInfo = {
                nombre: `FakeName`,
                genero: false,
                descripcion: `Fake description`,
                fechadenacimiento: `2017-05-29`,
                pais: 23
            }
            await user.putInfo(idUser, newFakeInfo);

            let info = await user.getInfo(idUser);
            expect(newFakeInfo.nombre).equal(info.nombre);
            expect(newFakeInfo.genero).equal(info.genero);
            expect(newFakeInfo.descripcion).equal(info.descripcion);
            expect(newFakeInfo.fechadenacimiento).equal(info.fechadenacimiento);
            expect(newFakeInfo.pais).equal(newFakeInfo.pais);
        });
    });

    describe("post & get user settings operation", function() {
        it("should return user settings successfully", async function() {
            //create user
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);

            //select id from user
            let query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let res = (await dbCtrl.execute(query)).rows[0];
            idUser = res.id;

            //insert new settings
            let newSettings = {
                sEdad: false,
                sDistancia: true,
                sInvitacion: false,
                sSeguidor: false,
                nMensaje: true,
            }
            await user.putSettings(idUser, newSettings);
            settings = (await user.getSettings(idUser));

            //make sure the settings have been updated
            assert.equal(settings.sedad, newSettings.sEdad);
            assert.equal(settings.sdistancia, newSettings.sDistancia);
            assert.equal(settings.sinvitacion, newSettings.sInvitacion);
            assert.equal(settings.sseguidor, newSettings.sSeguidor);
            assert.equal(settings.nmensaje, newSettings.nMensaje);
        });
    });

    describe("fbLogin(user)", function() {
        it("should login with fb if the user doesn't exists", async function() {
            const fakeFbUser = {
                nombre: "FakeFbName",
                password: "fakeFbHash",
                email: "fakeFb@example.com",
            };
            const res = await user.fbLogin(fakeFbUser);
            
            const userDb = await user.getByEmail(fakeFbUser.email);            
            expect(res.created).to.equal(true);
            expect(userDb.nombre).to.equal(fakeFbUser.nombre);
            expect(userDb.email).to.equal(fakeFbUser.email);
        });

        it("should login with fb if the user already exists", async function() {
            const fakeFbUser = {
                nombre: "FakeFbName",
                password: "fakeFbHash",
                email: "fakeFb@example.com",
            };
            await user.fbLogin(fakeFbUser);            
            const res = await user.fbLogin(fakeFbUser);
            
            const userDb = await user.getByEmail(fakeFbUser.email);            
            expect(res.created).to.equal(false);
            expect(userDb.nombre).to.equal(fakeFbUser.nombre);
            expect(userDb.email).to.equal(fakeFbUser.email);
        });
    })

    describe('setProfileImage(id, img, ext)', function() {
        it('should set profile image correctly', async function(){
            const fakeUser = {
                nombre: 'Fake',
                password: 'fakeHash',
                email: 'fake@example.com',
            }
            const res = await user.create(fakeUser)
            const id = res.id
            const pathImg = path.join(userTestResourcePath, 'profile.jpg')
            const img = await fs.readFile(pathImg, {encoding: constants.encoding })
            const ext = 'jpg'
            await user.setProfileImg(id, img, ext)

            const newImg = await user.getProfileImg(id)
            const pathNewImg = path.join(userResourcePath, `${id}`, 'profile')
            const files = await fs.readdir(pathNewImg)
            const newImgName = files[0]
            const dotIndex = newImgName.lastIndexOf('.')
            const newImgExt = newImgName.slice(dotIndex+1)
            expect(newImg).to.equal(img)
            expect(newImgExt).to.equal(ext)

            const pathUser = path.join(userResourcePath, `${id}`)
            fs.rmdir(pathUser, {recursive: true})
        })

        it("should not set profile image if user doesn't exist", async function() {
            const id = 0;
            const pathImg = path.join(userTestResourcePath, 'profile.jpg')
            const img = await fs.readFile(pathImg)
            const ext = 'jpg'
            await expect(user.setProfileImg(id, img, ext))
                .to.eventually.be.rejectedWith(Error, 'User does not exist')
        })
    })

    describe('getProfileImg(id)', function() {
        it('should return the profile image', async function() {
            const fakeUser = {
                nombre: 'Fake',
                password: 'fakeHash',
                email: 'fake@example.com',
            }
            const res = await user.create(fakeUser)
            const id = res.id
            const pathImg = path.join(userTestResourcePath, 'profile.jpg')
            const img = await fs.readFile(pathImg, {encoding: constants.encoding})
            const ext = 'jpg'
            await user.setProfileImg(id, img, ext)

            const newImg = await user.getProfileImg(id)
            expect(newImg).to.equal(img)

            const pathUser = path.join(userResourcePath, `${id}`)
            fs.rmdir(pathUser, {recursive: true})
        })

        it('should not return the profile image if the user does not have any', async function() {
            const fakeUser = {
                nombre: 'Fake',
                password: 'fakeHash',
                email: 'fake@example.com',
            }
            const res = await user.create(fakeUser)
            const id = res.id
            await expect(user.getProfileImg(id)).to.eventually.be
                .rejectedWith(Error, 'User does not have profile image')
        })

        it("should not return the profile image if the user doesn't exist", async function() {
            const id = 0
            await expect(user.getProfileImg(id)).to.eventually.be
                .rejectedWith(Error, "User does not exist")
        })
    })

    describe('followers operations', function() {
        it('should create a follower', async function() {
            const fakeUser = {
                nombre: 'Fake',
                password: 'fakeHash',
                email: 'fake@example.com',
            }
            let res = await user.create(fakeUser);
            const idFr = res.id;
            
            const fakeUser2 = {
                nombre: 'Fake2',
                password: 'fakeHash2',
                email: 'fake2@example.com',
            }
            res = await user.create(fakeUser2);
            const idFd = res.id;

            const body = {
                idFollower: idFr,
                idFollowed: idFd
            }

            await user.follow(body);
            const query = {
                text: 'SELECT * \
                        FROM seguidores \
                        WHERE idSeguidor = $1 AND idSeguido = $2',
                values: [idFr, idFd]
            };
            res = await dbCtrl.execute(query);
            assert.equal(res.rows.length, 1);
            
            const infoFollower = (await user.getInfo(idFr));
            assert.equal(infoFollower.nseguidos, 1);

            const infoFollowed = (await user.getInfo(idFd));
            assert.equal(infoFollowed.nseguidores, 1);
        })

        it("should delete a follower", async function() {
            const fakeUser = {
                nombre: 'Fake',
                password: 'fakeHash',
                email: 'fake@example.com',
            }
            let res = await user.create(fakeUser);
            const idFr = res.id;
            
            const fakeUser2 = {
                nombre: 'Fake2',
                password: 'fakeHash2',
                email: 'fake2@example.com',
            }
            res = await user.create(fakeUser2);
            const idFd = res.id;

            const body = {
                idFollower: idFr,
                idFollowed: idFd
            }
            const idFollower = idFr;
            const idFollowed = idFd;

            await user.follow(body);
            await user.unfollow(idFollower, idFollowed);
            const query = {
                text: 'SELECT * \
                        FROM seguidores \
                        WHERE idSeguidor = $1 AND idSeguido = $2',
                values: [idFr, idFd]
            };
            res = await dbCtrl.execute(query);
            assert.equal(res.rows.length, 0);

            const infoFollower = (await user.getInfo(idFr));
            assert.equal(infoFollower.nseguidos, 0);

            const infoFollowed = (await user.getInfo(idFd));
            assert.equal(infoFollowed.nseguidores, 0);
        })

        it("should get the followers of a user", async function() {
            const fakeUser = {
                nombre: 'Fake',
                password: 'fakeHash',
                email: 'fake@example.com',
            }
            let res = await user.create(fakeUser);
            const idFr = res.id;
            
            const fakeUser2 = {
                nombre: 'Fake2',
                password: 'fakeHash2',
                email: 'fake2@example.com',
            }
            res = await user.create(fakeUser2);
            const idFr2 = res.id;

            const fakeUser3 = {
                nombre: 'Fake3',
                password: 'fakeHash3',
                email: 'fake3@example.com',
            }
            res = await user.create(fakeUser3);
            const idFd = res.id;

            const fakeUser4 = {
                nombre: 'Fake4',
                password: 'fakeHash4',
                email: 'fake4@example.com',
            }
            res = await user.create(fakeUser4);

            let body = {
                idFollower: idFr,
                idFollowed: idFd
            }

            await user.follow(body);

            body = {
                idFollower: idFr2,
                idFollowed: idFd
            }

            await user.follow(body);

            res = await user.followers(idFd);
            
            assert.equal(res.length, 2);
            assert.equal(res[0].nombre, fakeUser.nombre);
            assert.equal(res[0].id, idFr);
            assert.equal(res[1].nombre, fakeUser2.nombre);
            assert.equal(res[1].id, idFr2);
            
        })

        it("should get the people this user follows", async function() {
            const fakeUser = {
                nombre: 'Fake',
                password: 'fakeHash',
                email: 'fake@example.com',
            }
            let res = await user.create(fakeUser);
            const idFr = res.id;
            
            const fakeUser2 = {
                nombre: 'Fake2',
                password: 'fakeHash2',
                email: 'fake2@example.com',
            }
            res = await user.create(fakeUser2);
            const idFd2 = res.id;

            const fakeUser3 = {
                nombre: 'Fake3',
                password: 'fakeHash3',
                email: 'fake3@example.com',
            }
            res = await user.create(fakeUser3);
            const idFd3 = res.id;

            const fakeUser4 = {
                nombre: 'Fake4',
                password: 'fakeHash4',
                email: 'fake4@example.com',
            }
            res = await user.create(fakeUser4);

            let body = {
                idFollower: idFr,
                idFollowed: idFd2
            }

            await user.follow(body);

            body = {
                idFollower: idFr,
                idFollowed: idFd3
            }

            await user.follow(body);

            res = await user.followed(idFr);
            
            assert.equal(res.length, 2);
            assert.equal(res[0].nombre, fakeUser2.nombre);
            assert.equal(res[0].id, idFd2);
            assert.equal(res[1].nombre, fakeUser3.nombre);
            assert.equal(res[1].id, idFd3);
        })

        it("should get the brief information of all users except the one we pass", async function() {
            const fakeUser = {
                nombre: 'Fake',
                password: 'fakeHash',
                email: 'fake@example.com',
            }
            let res = await user.create(fakeUser);
            const currentID = res.id;
            
            const fakeUser2 = {
                nombre: 'Fake2',
                password: 'fakeHash2',
                email: 'fake2@example.com',
            }
            res = await user.create(fakeUser2);

            const fakeUser3 = {
                nombre: 'Fake3',
                password: 'fakeHash3',
                email: 'fake3@example.com',
            }
            res = await user.create(fakeUser3);

            const fakeUser4 = {
                nombre: 'Fake4',
                password: 'fakeHash4',
                email: 'fake4@example.com',
            }
            res = await user.create(fakeUser4);
            let id4 = res.id;

            res = await user.shortUsersInfo(currentID);
            
            assert.equal(res.length, 3);
            assert.equal(res[0].nombre, fakeUser2.nombre);
            assert.equal(res[1].nombre, fakeUser3.nombre);
            assert.equal(res[2].id, id4);
            
        })
    })
})