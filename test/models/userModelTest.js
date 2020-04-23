const assert = require("assert");
const chai = require("chai");

const user = require("../../src/models/userModel");
const training = require("../../src/models/trainingModel");
const diet = require("../../src/models/dietModel")
const dbCtrl = require("../../src/ctrls/dbCtrl");

require("../rootHooks");
const expect = chai.expect;

describe("userModel script", function() {
    describe("create function", function() {
        it("should return user created correctly", async function() {
            const fakeUser = {
                nombre: "Fake",
                password: "fakeHash",
                email: "fake@example.com",
            }
            const creation = await user.create(fakeUser);

            const query = {
                text: "SELECT id, nombre, password, email \
                        FROM usuarios \
                        WHERE email = $1",
                values: [fakeUser.email],
            };
            const userdb = (await dbCtrl.execute(query)).rows[0];
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


    describe("delete user", function() {        
        it ("should return deleted correctly", async function() {
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);
            let newUser2 = {
                nombre: "Oriol2",
                password: "hash2",
                email: "oriol2@example.com",
            }
            await user.create(newUser2);
            
            let queryGetID = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let idTest = (await dbCtrl.execute(queryGetID)).rows[0].id;
            await user.del(idTest);

            let query = {
                text: "SELECT nombre, password, email \
                        FROM usuarios" ,
            };
            let res = (await dbCtrl.execute(query)).rows;
            assert.equal(res.length, 1);
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

            const query = {
                text: 'SELECT id FROM usuarios \
                        WHERE email = $1',
                values: [fakeUser.email]
            }
            const id = (await dbCtrl.execute(query)).rows[0].id;
            assert.strictEqual(validation.result, true);
            assert.strictEqual(validation.id, id);
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

        it("should return set of trainings correctly", async function(){
            //create user
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);

            //select id from user in order to create a training (we need it for the foreign key of element)
            let query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let res = (await dbCtrl.execute(query)).rows[0];
            idTest = res.id; 

            //create training 1 (and element)
            let newTraining = {
                nombre: "TrainingTest",
                descripcion: "TrainingDescription",
                idUser: idTest,
            }
            await training.create(newTraining);

            //create training 2 (and element)
            let newTraining2 = {
                nombre: "TrainingTest2",
                descripcion: "TrainingDescription",
                idUser: idTest,
            }
            await training.create(newTraining2);

            let trainingSet = await user.trainings(idTest);

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

            let info = (await user.userInfo(idUser));
            assert.equal(info.nombre, newUser.nombre);
            assert.equal(info.rutaImagen, null);
            assert.equal(info.nseguidores, 0);
            assert.equal(info.nseguidos, 0);
            assert.equal(info.npost, 0);
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
            await user.putUserSettings(idUser, newSettings);
            settings = (await user.getUserSettings(idUser));

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
    });
});