const assert = require("assert");

const user = require("../src/models/userModel");
const training = require("../src/models/trainingModel");
const diet = require("../src/models/dietModel")
const dbCtrl = require("../src/ctrls/dbCtrl");

require("./rootHooks");

describe("userModel script", function() {

    describe("create function", function() {

        beforeEach(async function() {
            await dbCtrl.execute("DELETE FROM usuarios");
        });


        it("should create a new user", async function() {
            const fakeUser = {
                nombre: "FakeName",
                password: "fakeHash",
                email: "fake@example.com",
            }
            await user.create(fakeUser);

            const query = {
                text: "SELECT nombre, password, email \
                        FROM usuarios \
                        WHERE email = $1",
                values: [fakeUser.email],
            };
            const res = (await dbCtrl.execute(query)).rows[0];            
            assert.equal(fakeUser.nombre, res.nombre);
            assert.equal(fakeUser.password, res.password);
            assert.equal(fakeUser.email, res.email);

            dbCtrl.execute({
                text: "DELETE FROM usuarios WHERE email = $1",
                values: [fakeUser.email]
            });
        });

        it("should return unique constraint violation", async function() {
            const fakeUser = {
                nombre: "FakeName",
                password: "fakeHash",
                email: "fake@example.com",
            }
            await user.create(fakeUser);
            
            const fakeUser2 = {
                nombre: "FakeName2",
                password: "fakeHash2",
                email: fakeUser.email
            };
            await assert.rejects(() => user.create(fakeUser2), Error);

            dbCtrl.execute({
                text: "DELETE FROM usuarios WHERE email = $1",
                values: [fakeUser.email]
            });
        });

        it("should NOT insert a user without a password", async function() {
            const fakeUser = {
                nombre: "Fake",
                email: "fake@example.com",
            }

            await assert.rejects(async () => user.create(fakeUser), Error);
        });
    });


    describe("delete user", function() {
        beforeEach(async function() {
            await dbCtrl.execute("DELETE FROM usuarios");
        });
        
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

        before(async function() {
            await dbCtrl.execute("DELETE FROM usuarios");            
            await user.create(fakeUser);
        });


        it("should validate email & password", async function(){
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
            const validation = await user.validate({
                email: "another@example.com",
                password: "anotherHash"
            });

            assert.strictEqual(validation.result, false);
            assert.strictEqual(validation.id, undefined);
        });

        it("should NOT validate just email", async function() {
            const validation = await user.validate({
                email: fakeUser.email
            });

            assert.strictEqual(validation.result, false);
            assert.strictEqual(validation.id, undefined);
        });

        it("should NOT validate just password", async function() {
            const validation = await user.validate({
                password: fakeUser.password
            });

            assert.strictEqual(validation.result, false);
            assert.strictEqual(validation.id, undefined);
        });

        after(async function() {
            await dbCtrl.execute({
                text: "DELETE FROM usuarios WHERE nombre=$1",
                values: [fakeUser.nombre]
            });
        });
    });
    describe("get operation", function() {

        beforeEach(async function() {
            await dbCtrl.execute("DELETE FROM usuarios");
        });

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

            assert.equal(trainingSet.rows[0].nombre, newTraining.nombre);
            assert.equal(trainingSet.rows[0].descripcion, newTraining.descripcion);
            assert.equal(trainingSet.rows[1].nombre, newTraining2.nombre);
            assert.equal(trainingSet.rows[1].descripcion, newTraining2.descripcion);
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
            assert.equal(trainingSet.rows.length, 0);

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
            assert.equal(trainingSet.rows.length, 0);
        });
    });
});