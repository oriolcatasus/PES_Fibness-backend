const assert = require("assert");
const path = require('path')
const fs = require('fs').promises

const user = require("../../src/models/userModel");
const training = require("../../src/models/trainingModel");
const diet = require("../../src/models/dietModel")
const route = require("../../src/models/routeModel");
const dbCtrl = require("../../src/ctrls/dbCtrl");
const comment = require("../../src/models/commentModel");
const exercise = require("../../src/models/exerciseModel");
const meal = require("../../src/models/mealModel");
const aliment = require("../../src/models/alimentModel");
const event = require('../../src/models/eventModel');
const statistic = require('../../src/models/statisticModel');
const likeelemento = require('../../src/models/likeelementoModel.js');

const testConstants = require('../constants')
const constants = require('../../src/constants')
const expect = require('../chaiConfig')

const userTestResourcePath = path.join(testConstants.resourcePath, 'user')
const userResourcePath = path.join(constants.resourcePath, 'user')

//require("../rootHooks");

describe("userModel script", function() {
    
    const fakeUser = {
        nombre: "Fake",
        password: "fakeHash",
        email: "fake@example.com",
    }

    describe("create function", function() {
        it("should return user created correctly", async function() {            
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
            //create route 1 (and element)
            const newRoute = {
                nombre: "RouteTest",
                descripcion: "RouteDescription",
                origen: "CoordenateOrigin",
                destino: "CoordenateDestine",
                distancia: "distancia_1",
                idUser: idUser,
            }
            await route.create(newRoute);

            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newRoute.nombre, idUser],
            };

            res2 = (await dbCtrl.execute(queryGetID)).rows[0];
            idElem1 = res2.idelemento;
            const newRoute2 = {
                nombre: "RouteTest2",
                descripcion: "RouteDescription",
                origen: "CoordenateOrigin",
                destino: "CoordenateDestine",
                distancia: "distancia_2",
                idUser: idUser,
            }
            await route.create(newRoute2);

            let queryGetID2 = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newRoute2.nombre, idUser],
            };
            res3 = (await dbCtrl.execute(queryGetID2)).rows[0];
            idElem2 = res3.idelemento;

            const routeSet = await user.routes(idUser);

            assert.equal(routeSet[0].nombre, newRoute.nombre);
            assert.equal(routeSet[0].descripcion, newRoute.descripcion);
            assert.equal(routeSet[0].origen, newRoute.origen);
            assert.equal(routeSet[0].destino, newRoute.destino);
            assert.equal(routeSet[0].distancia, newRoute.distancia);
            assert.equal(routeSet[1].nombre, newRoute2.nombre);
            assert.equal(routeSet[1].descripcion, newRoute2.descripcion);
            assert.equal(routeSet[1].origen, newRoute2.origen);
            assert.equal(routeSet[1].destino, newRoute2.destino);
            assert.equal(routeSet[1].distancia, newRoute2.distancia);
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
            let newRoute = {
                nombre: "RouteTest",
                descripcion: "RouteDescription",
                origen: "CoordenateOrigin",
                destino: "CoordenateDestine",
                idUser: idUser2,
            }
            await route.create(newRoute);


            //getting trainings of user1 and making sure there is none
            let routeSet = await user.routes(idUser);
            assert.equal(routeSet.length, 0);
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
        it("should return set of statistics correctly", async function(){
            //create user
            const fakeUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            const res = await user.create(fakeUser);
            idUser = res.id;
            //create statistic 1
            const newStatistic = {
                idUser: idUser,
                dstRecorrida: '40'
            }
            await statistic.create(newStatistic);
            //update the statistic adding dstRecorrida to the previous one
            const newStatistic2 = {
                idUser: idUser,
                dstRecorrida: '60'
            }
            await statistic.create(newStatistic2);

            const listSet = await user.statistics(idUser);
            let i = 1;
            const currentdate = new Date();
            let weekday = currentdate.getDay();
            if (weekday == 0 ){ weekday = 7;}

            //We expect the length of the list to be equal to the number of days since the begining of that week until the current day
            assert.equal(weekday,listSet.length);
            //In this case all the values of dstRecorrida before the last one are equal to 0
            while(i < listSet.length){
                assert.equal(i,listSet[i-1].dia);
                assert.equal(0,listSet[i-1].dstrecorrida);
                i++; 
            }
            //The last statistic of the list corresponts allways to the currentDate
            assert.equal(weekday,listSet[listSet.length-1].dia);
            assert.equal(parseInt(newStatistic.dstRecorrida)+parseInt(newStatistic2.dstRecorrida),listSet[listSet.length-1].dstrecorrida)
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

        it('should not create a follower if it is blocked', async function() {
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

            let body = {
                idBlocker: idFd,
                idBlocked: idFr
            }

            await user.block(body);

            body = {
                idFollower: idFr,
                idFollowed: idFd
            }

            res = await user.follow(body);
            assert.equal(res.isBlocked, true);
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
            
            expect(res).to.have.length(2)
            expect(res).to.include.something.like({
                id: idFd2,
                nombre: fakeUser2.nombre
            })
            expect(res).to.include.something.like({
                id: idFd3,
                nombre: fakeUser3.nombre
            })
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
            const id2 = res.id;
            const fakeUser3 = {
                nombre: 'Fake3',
                password: 'fakeHash3',
                email: 'fake3@example.com',
            }
            res = await user.create(fakeUser3);
            const id3 = res.id;
            const fakeUser4 = {
                nombre: 'Fake4',
                password: 'fakeHash4',
                email: 'fake4@example.com',
            }
            res = await user.create(fakeUser4);
            const id4 = res.id;
            res = await user.shortUsersInfo(currentID);
            
            expect(res).to.be.lengthOf(3)
            expect(res).to.include.something.like({
                id: id2,
                nombre: fakeUser2.nombre
            })
            expect(res).to.include.something.like({
                id: id3,
                nombre: fakeUser3.nombre
            })
            expect(res).to.include.something.like({
                id: id4,
                nombre: fakeUser4.nombre
            })           
        })

        it("should get the brief information of all users except the one we pass and the ones who blocked", async function() {
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
            const id4 = res.id;
            const fakeUser5 = {
                nombre: 'Fake5',
                password: 'fakeHash5',
                email: 'fake5@example.com',
            }
            res = await user.create(fakeUser5);
            const id5 = res.id;
            let body = {
                idBlocker: currentID,
                idBlocked: id4
            }           
            await user.block(body);
            body = {
                idBlocker: id5,
                idBlocked: currentID
            }           
            await user.block(body);
            res = await user.shortUsersInfo(currentID);
            
            expect(res).to.be.lengthOf(3)
            expect(res).to.include.something.like({
                nombre: fakeUser2.nombre
            })
            expect(res).to.include.something.like({
                nombre: fakeUser3.nombre
            })
            expect(res).to.include.something.like({
                nombre: fakeUser4.nombre,
                bloqueado: true
            })            
        })
    })

    describe("blocking operations", function() {
        it("should successfully block a user", async function() {
            const fakeUser = {
                nombre: 'Fake',
                password: 'fakeHash',
                email: 'fake@example.com',
            }
            let res = await user.create(fakeUser);
            const idBr = res.id;
            
            const fakeUser2 = {
                nombre: 'Fake2',
                password: 'fakeHash2',
                email: 'fake2@example.com',
            }
            res = await user.create(fakeUser2);
            const idBd = res.id;

            const body = {
                idBlocker: idBr,
                idBlocked: idBd
            }
           
            await user.block(body);

            const query = {
                text: 'SELECT * \
                        FROM bloqueados \
                        WHERE idBloqueador = $1 AND idBloqueado = $2',
                values: [idBr, idBd]
            };

            res = (await dbCtrl.execute(query)).rows;

            //make sure the settings have been updated
            assert.equal(res[0].idbloqueador, idBr);
            assert.equal(res[0].idbloqueado, idBd);
        });

        it("should successfully block a user and delete the following", async function() {
            const fakeUser = {
                nombre: 'Fake',
                password: 'fakeHash',
                email: 'fake@example.com',
            }
            let res = await user.create(fakeUser);
            const idBr = res.id;
            
            const fakeUser2 = {
                nombre: 'Fake2',
                password: 'fakeHash2',
                email: 'fake2@example.com',
            }
            res = await user.create(fakeUser2);
            const idBd = res.id;

            let body = {
                idFollower: idBr,
                idFollowed: idBd
            }
            res = await user.follow(body);
            assert.equal(res.isBlocked, false);

            body = {
                idFollower: idBd,
                idFollowed: idBr
            }
           
            res = await user.follow(body);
            assert.equal(res.isBlocked, false);

            body = {
                idBlocker: idBr,
                idBlocked: idBd
            }

            res = await user.block(body);
            assert.equal(res.blockerFollowedBlocked, true);
            assert.equal(res.blockedFollowedBlocker, true);

            const query = {
                text: 'SELECT * \
                        FROM bloqueados \
                        WHERE idBloqueador = $1 AND idBloqueado = $2',
                values: [idBr, idBd]
            };

            res = (await dbCtrl.execute(query)).rows;

            assert.equal(res[0].idbloqueador, idBr);
            assert.equal(res[0].idbloqueado, idBd);

            const infoFollower = (await user.getInfo(idBr));
            assert.equal(infoFollower.nseguidos, 0);

            const infoFollowed = (await user.getInfo(idBd));
            assert.equal(infoFollowed.nseguidores, 0);
        });

        it("should successfully unblock a user", async function() {
            const fakeUser = {
                nombre: 'Fake',
                password: 'fakeHash',
                email: 'fake@example.com',
            }
            let res = await user.create(fakeUser);
            const idBr = res.id;
            
            const fakeUser2 = {
                nombre: 'Fake2',
                password: 'fakeHash2',
                email: 'fake2@example.com',
            }
            res = await user.create(fakeUser2);
            const idBd = res.id;

            const body = {
                idBlocker: idBr,
                idBlocked: idBd
            }
           
            await user.block(body);

            let query = {
                text: 'SELECT * \
                        FROM bloqueados \
                        WHERE idBloqueador = $1 AND idBloqueado = $2',
                values: [idBr, idBd]
            };

            res = (await dbCtrl.execute(query)).rows;

            assert.equal(res.length, 1);

            await user.unblock(idBr, idBd);

            query = {
                text: 'SELECT * \
                        FROM bloqueados \
                        WHERE idBloqueador = $1 AND idBloqueado = $2',
                values: [idBr, idBd]
            };

            res = (await dbCtrl.execute(query)).rows;

            assert.equal(res.length, 0);
        });
    });

    describe("get full user info", function() {
        it("should successfully return the info of a user", async function() {
            const fakeUser = {
                nombre: 'Fake',
                password: 'fakeHash',
                email: 'fake@example.com',
            }
            let res = await user.create(fakeUser);
            const id = res.id;
            
            const fakeUser2 = {
                nombre: 'Fake2',
                password: 'fakeHash2',
                email: 'fake2@example.com',
            }
            res = await user.create(fakeUser2);
            const id2 = res.id;

            let body = {
                idFollower: id2,
                idFollowed: id
            }

            await user.follow(body);
            let info = await user.userInfo(id, id2);

            assert.equal(info.id, id);
            assert.equal(info.nombre, fakeUser.nombre);
            assert.equal(Object.keys(info).length, 12);
            assert.equal(info.seguir, true);
            assert.equal(info.bloqueado, false);

            body = {
                idBlocker: id2,
                idBlocked: id
            }

            await user.block(body);
            info = await user.userInfo(id, id2);
            assert.equal(info.bloqueado, true);
        });
    });

    describe("like and dislike operations", function() {
        it("should successfully like an element", async function() {
            const fakeUser = {
                nombre: 'Fake',
                password: 'fakeHash',
                email: 'fake@example.com',
            }
            let res = await user.create(fakeUser);
            const id = res.id;

            const newTraining = {
                nombre: "TrainingTest",
                descripcion: "TrainingDescription",
                idUser: id,
            }
            const idElem = (await training.create(newTraining)).idElemento;

            const body = {
                idUser: id,
                idElement: idElem,
                type: 'element'
            }

            await user.like(body);

            const query = {
                text: 'SELECT * \
                        FROM likesElementos \
                        WHERE idUsuario = $1 AND idElemento = $2',
                values: [id, idElem]
            };

            res = (await dbCtrl.execute(query)).rows;
            assert.equal(res.length, 1);

            const trainingSet = await user.trainings(id);

            assert.equal(trainingSet[0].nlikes, 1);
            assert.equal(trainingSet[0].descripcion, newTraining.descripcion);
        });

        it("should successfully like a comment", async function() {
            
            const fakeUser = {
                nombre: 'Fake',
                password: 'fakeHash',
                email: 'fake@example.com',
            }
            let res = await user.create(fakeUser);
            const id = res.id;

            const newTraining = {
                nombre: "TrainingTest",
                descripcion: "TrainingDescription",
                idUser: id,
            }
            const idElem = (await training.create(newTraining)).idElemento;

            const bodyComment = {
                idUser: id,
                idElement: idElem,
                text: "primer comentario"
            }
            await comment.comment(bodyComment);

            let query = {
                text: 'SELECT idComentario \
                        FROM comentarios \
                        WHERE idUsuario = $1',
                values: [id]
            };
            const idCom = (await dbCtrl.execute(query)).rows[0].idcomentario;

            const bodyLike = {
                idUser: id,
                idElement: idCom,
                type: 'comment'
            }

            await user.like(bodyLike);

            query = {
                text: 'SELECT * \
                        FROM likesComentarios \
                        WHERE idUsuario = $1 AND idElemento = $2',
                values: [id, idCom]
            };

            res = (await dbCtrl.execute(query)).rows;
            assert.equal(res.length, 1);

            const commentSet = await comment.comments(idElem);
            console.log(commentSet);

            assert.equal(commentSet[0].nlikes, 1);
            assert.equal(commentSet[0].texto, bodyComment.text);
            assert.equal(commentSet[0].nombre, 'Fake')
        });

        it("should successfully unlike an element", async function() {
            const fakeUser = {
                nombre: 'Fake',
                password: 'fakeHash',
                email: 'fake@example.com',
            }
            let res = await user.create(fakeUser);
            const id = res.id;

            const newTraining = {
                nombre: "TrainingTest",
                descripcion: "TrainingDescription",
                idUser: id,
            }
            const idElem = (await training.create(newTraining)).idElemento;

            const body = {
                idUser: id,
                idElement: idElem,
                type: 'element'
            }

            await user.like(body);
            await user.unlike(id, idElem, 'element');

            const query = {
                text: 'SELECT * \
                        FROM likesElementos \
                        WHERE idUsuario = $1 AND idElemento = $2',
                values: [id, idElem]
            };

            res = (await dbCtrl.execute(query)).rows;
            assert.equal(res.length, 0);

            const trainingSet = await user.trainings(id);

            assert.equal(trainingSet[0].nlikes, 0);
            assert.equal(trainingSet[0].descripcion, newTraining.descripcion);
        });

        it("should successfully unlike a comment", async function() {
            
            const fakeUser = {
                nombre: 'Fake',
                password: 'fakeHash',
                email: 'fake@example.com',
            }
            let res = await user.create(fakeUser);
            const id = res.id;

            const newTraining = {
                nombre: "TrainingTest",
                descripcion: "TrainingDescription",
                idUser: id,
            }
            const idElem = (await training.create(newTraining)).idElemento;

            const bodyComment = {
                idUser: id,
                idElement: idElem,
                text: "primer comentario"
            }
            await comment.comment(bodyComment);

            let query = {
                text: 'SELECT idComentario \
                        FROM comentarios \
                        WHERE idUsuario = $1',
                values: [id]
            };
            const idCom = (await dbCtrl.execute(query)).rows[0].idcomentario;

            const bodyLike = {
                idUser: id,
                idElement: idCom,
                type: 'comment'
            }

            await user.like(bodyLike);
            await user.unlike(id, idCom, 'comment');

            query = {
                text: 'SELECT * \
                        FROM likesComentarios \
                        WHERE idUsuario = $1 AND idElemento = $2',
                values: [id, idCom]
            };

            res = (await dbCtrl.execute(query)).rows;
            assert.equal(res.length, 0);

            const commentSet = await comment.comments(idElem);

            assert.equal(commentSet[0].nlikes, 0);
            assert.equal(commentSet[0].texto, bodyComment.text);
        });
    });

    describe("import operations", function() {
        it("should successfully import", async function() {
            const fakeUser = {
                nombre: 'Fake',
                password: 'fakeHash',
                email: 'fake@example.com',
            }
            let res = await user.create(fakeUser);
            const id = res.id;    
            const fakeUser2 = {
                nombre: 'Fake2',
                password: 'fakeHash2',
                email: 'fake2@example.com'
            }
            res = await user.create(fakeUser2);
            const id2 = res.id;

            //create training  (and element)
            let newTraining = {
                nombre: "TrainingTest",
                descripcion: "TrainingDescription",
                idUser: id,
            }
            await training.create(newTraining);

            //get the automatically generated id for the training in order to access it
            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newTraining.nombre, id],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idTrainingTest = res.idelemento;

             //create exercise( and activity)
             let newExercise = {
                nombre: "exerciseTest",
                descripcion: "exerciseDescription",
                tiempoEjecucion: 4,
                idEntrenamiento: idTrainingTest,
                numSets: 3,
                numRepeticiones: 2,
                tiempoDescanso: 1,
                posicion: 2,
            }
            let idActividad_resp = (await exercise.create(newExercise)).idExercise;

            //create exercise( and activity) 2
            newExercise = {
                nombre: "exerciseTest2",
                descripcion: "exerciseDescription2",
                tiempoEjecucion: 42,
                idEntrenamiento: idTrainingTest,
                numSets: 32,
                numRepeticiones: 22,
                tiempoDescanso: 12,
                posicion: 3,
            }
            idActividad_resp = (await exercise.create(newExercise)).idExercise;

            //get the automatically generated id for the exercise in order to access it
            queryGetID = {
                text: "SELECT idactividad \
                       FROM actividades \
                       WHERE nombre = $1 and idEntrenamiento = $2\
                       ORDER BY idActividad DESC",
                values: [newExercise.nombre,newExercise.idEntrenamiento],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            let idActi = res.idactividad;

            let body = {
                type: "training",
                idElement: idTrainingTest,
                idUser: id2
            }

            await user.importE(body);

            queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newTraining.nombre, id2],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            newTraining = res.idelemento;

            oldExercise = await training.activities(idTrainingTest);
            newExercise = await training.activities(newTraining);

            /*console.log ("oldExercise");
            console.log(oldExercise);
            console.log("newExercise");
            console.log(newExercise); */

            assert.equal(oldExercise.length, newExercise.length);
            assert.equal(oldExercise[0].nombre, newExercise[0].nombre);
            assert.notEqual(oldExercise[0].idactividad, newExercise[0].idactividad);
            assert.equal(oldExercise[1].numrepeticiones, newExercise[1].numrepeticiones);


            //create diet (and element)
            let newDiet = {
                nombre: "DietTest",
                descripcion: "DietDescription",
                idUser: id,
            }
            idDiet = await diet.create(newDiet);

            //get the automatically generated id for the diet in order to access it
            queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newDiet.nombre, id],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idElem = res.idelemento;

            //create a meal
            let newMeal = {
                nombre: "MealTest",
                horaComida: '22:00:00',
                idElemento: idElem,
                tipoDia: "miercoles",
            };

            idMeal = (await meal.create(newMeal)).idComida;

            //create an aliment
            let newAliment = {
                nombre: "AlimentTest",
                descripcion: "descriptionTest",
                calorias: '300',
                idComida: idMeal,
            };

            idAliment = (await aliment.create(newAliment)).idAlimento;

            //create a meal 2
            newMeal = {
                nombre: "MealTest2",
                horaComida: '23:00:00',
                idElemento: idElem,
                tipoDia: "martes",
            };

            idMeal = (await meal.create(newMeal)).idComida;

            //create an aliment 2
            newAliment = {
                nombre: "AlimentTest2",
                descripcion: "descriptionTest2",
                calorias: '500',
                idComida: idMeal,
            };

            idAliment = (await aliment.create(newAliment)).idAlimento;

            body = {
                type: "diet",
                idElement: idDiet.idElemento,
                idUser: id2
            }
            await user.importE(body);

            queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newDiet.nombre, id2],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            newDietID = res.idelemento;

            oldMeals = await diet.dayMeals(idElem, "martes");
            newMeals = await diet.dayMeals(newDietID, "martes"); 
            //console.log("oldMeals:")
            //console.log(oldMeals);
            //console.log("newMeals:")
            //console.log(newMeals);

            oldAliments = await meal.aliments(idMeal);
            newAliments = await meal.aliments(newMeals[0].idcomida)
            //console.log("oldAliments:")
            //console.log(oldAliments);
            //console.log("newAliments:")
            //console.log(newAliments);


            assert.equal(oldMeals.length, newMeals.length);
            assert.equal(oldMeals[0].nombre, newMeals[0].nombre);
            assert.notEqual(oldMeals[0].idcomida, newMeals[0].idcomida);
            assert.equal(oldAliments[0].descripcion, newAliments[0].descripcion);

            //create route (and element)
            let newRoute = {
                nombre: "RouteTest",
                descripcion: "RouteDescription",
                idUser: id,
                origen:"Coodenateorigen",
                destino:"Coordenatedestine",
                distancia: "distancia",
            }
            let idElemento_resp = (await route.create(newRoute)).idElemento;
            
            //get the automatically generated id for the route in order to access it
            queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newRoute.nombre, id],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idElem = res.idelemento;
            // Assert that the id that was return by the creation is the same as the id get by using the query
            assert.equal(idElemento_resp, idElem);

            body = {
                type: "route",
                idElement: idElem,
                idUser: id2
            }

            await user.importE(body);

            //get the route that we have created
            query = {
                text: "SELECT origen, destino, distancia \
                        FROM rutas \
                        WHERE idElemento = $1",
                values: [idElem],
            };

            //make sure it really is the route we created
            res = await dbCtrl.execute(query)

            query = {
                text: "SELECT idElemento\
                        FROM elementos \
                        WHERE idUsuario = $1 AND descripcion = $2",
                values: [id2, "RouteDescription"]
            };

            idNewRoute = (await dbCtrl.execute(query)).rows[0].idelemento

            query = {
                text: "SELECT origen, destino, distancia \
                        FROM rutas \
                        WHERE idElemento = $1",
                values: [idNewRoute],
            };

            res2 = await dbCtrl.execute(query)

            //console.log(res.rows);
            //console.log(res2.rows);

        });

        it("should return set of element liked correctly", async function(){
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
            idTr = (await training.create(newTraining)).idElemento;

            //create training 2 (and element)
            const newTraining2 = {
                nombre: "TrainingTest2",
                descripcion: "TrainingDescription",
                idUser,
            }
            idTr2 = (await training.create(newTraining2)).idElemento;

            const bodyLike = {
                idUser: idUser,
                idElement: idTr,
                type: 'element'
            }

            await user.like(bodyLike);

            let liked = await likeelemento.liked(idTr, idUser);
            assert.equal(liked.like, true);
            liked = await likeelemento.liked(idTr2, idUser);
            assert.equal(liked.like, false);
        });

    });
    describe('getEvents', function() {
        it('should get events ordered descending by date and hour', async function() {
            let res = await user.create(fakeUser)
            fakeUser.id = res.id
            const fakeEvents = [
                {
                    titulo: `FakeTitulo`,
                    descripcion: 'FakeDescripcion',
                    fecha: '2019-02-29',
                    hora: '00:00',
                    localizacion: 'fake',
                    idcreador: fakeUser.id
                },
                {
                    titulo: `FakeTitulo`,
                    descripcion: 'FakeDescripcion',
                    fecha: '2020-02-29',
                    hora: '00:00',
                    localizacion: 'fake',
                    idcreador: fakeUser.id
                },
                {
                    titulo: `FakeTitulo2`,
                    descripcion: 'FakeDescripcion2',
                    fecha: '2020-03-01',
                    hora: '10:00',
                    localizacion: 'fake',
                    idcreador: fakeUser.id
                },
                {
                    titulo: `FakeTitulo3`,
                    descripcion: 'FakeDescripcion3',
                    fecha: '2020-03-01',
                    hora: '10:01',
                    localizacion: 'fake',
                    idcreador: fakeUser.id
                },
                {
                    titulo: `FakeTitulo4`,
                    descripcion: 'FakeDescripcion4',
                    fecha: '2020-03-01',
                    hora: '11:01',
                    localizacion: 'fake',
                    idcreador: fakeUser.id
                }
            ]
            let promises = fakeEvents.map(value => event.create(value))
            res = await Promise.all(promises)
            res.forEach((value, index) => {
                fakeEvents[index].id = value.id
            })
            const eventsdb = await user.getEvents(fakeUser.id)
            
            expect(eventsdb).to.have.length(5)
            expect(eventsdb[0]).to.be.like(fakeEvents[4])
            expect(eventsdb[1]).to.be.like(fakeEvents[3])
            expect(eventsdb[2]).to.be.like(fakeEvents[2])
            expect(eventsdb[3]).to.be.like(fakeEvents[1])
            expect(eventsdb[4]).to.be.like(fakeEvents[0])
        })

        it('should return 0 events', async function() {
            let res = await user.create(fakeUser)
            fakeUser.id = res.id
            const eventsdb = await user.getEvents(fakeUser.id)
            
            expect(eventsdb).to.be.empty
        })

        it('should return only the user events', async function() {
            const fakeUser2 = {
                nombre: 'Fake2',
                password: 'fakeHash2',
                email: 'fake2@example.com'
            }
            let result = await Promise.all([
                user.create(fakeUser),
                user.create(fakeUser2)
            ])
            fakeUser.id = result[0].id
            fakeUser2.id = result[1].id
            const fakeEvents = [
                {
                    titulo: `FakeTitulo`,
                    descripcion: 'FakeDescripcion',
                    fecha: '2019-02-29',
                    hora: '00:00',
                    localizacion: 'fake',
                    idcreador: fakeUser.id
                },
                {
                    titulo: `FakeTitulo2`,
                    descripcion: 'FakeDescripcion2',
                    fecha: '2020-02-29',
                    hora: '00:00',
                    localizacion: 'fake',
                    idcreador: fakeUser2.id
                }
            ]
            let promises = fakeEvents.map(value => event.create(value))
            result = await Promise.all(promises)
            result.forEach((value, index) => {
                fakeEvents[index].id = value.id
            })
            const eventsdb = await user.getEvents(fakeUser2.id)
            
            expect(eventsdb).to.have.length(1)
            expect(eventsdb[0]).to.be.like(fakeEvents[1])
        })

        it('should return only the events created by the user, not which they participate', async function() {
            const fakeUser2 = {
                nombre: 'Fake2',
                password: 'fakeHash2',
                email: 'fake2@example.com'
            }
            let result = await Promise.all([
                user.create(fakeUser),
                user.create(fakeUser2)
            ])
            fakeUser.id = result[0].id
            fakeUser2.id = result[1].id
            const fakeEvents = [
                {
                    titulo: 'FakeTitulo',
                    descripcion: 'FakeDescripcion',
                    fecha: '2019-02-29',
                    hora: '00:00',
                    localizacion: 'fake',
                    idcreador: fakeUser.id
                },
                {
                    titulo: 'FakeTitulo2',
                    descripcion: 'FakeDescripcion2',
                    fecha: '2020-02-29',
                    hora: '00:00',
                    localizacion: 'fake',
                    idcreador: fakeUser2.id
                },
                {
                    titulo: 'FakeTitulo3',
                    descripcion: 'FakeDescripcion3',
                    fecha: '2020-02-29',
                    hora: '00:00',
                    localizacion: 'fake',
                    idcreador: fakeUser2.id
                }
            ]
            let promises = fakeEvents.map(value => event.create(value))
            result = await Promise.all(promises)
            result.forEach((value, index) => {
                fakeEvents[index].id = value.id
            })
            const participation = {
                idusuario: fakeUser.id
            }
            await event.join(fakeEvents[1].id, participation)
            const eventsdb = await user.getEvents(fakeUser.id)
            
            expect(eventsdb).to.have.length(1)
            expect(eventsdb[0]).to.be.like(fakeEvents[0])
        })
    })
})
