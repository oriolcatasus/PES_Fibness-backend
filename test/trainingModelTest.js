const assert = require("assert");

const user = require("../src/models/userModel");
const training = require("../src/models/trainingModel");
const dbCtrl = require("../src/ctrls/dbCtrl");

describe("trainingModel script", function() {
    describe("create function", function() {
        beforeEach(async function() {
            await dbCtrl.execute("DELETE FROM usuarios");
            await dbCtrl.execute("DELETE FROM elementos");
            await dbCtrl.execute("DELETE FROM entrenamientos");
        });

        it("should return training created correctly", async function() {
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);

            let query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let res = (await dbCtrl.execute(query)).rows[0];
            idTest = res.id; 

            let newTraining = {
                nombre: "TrainingTest",
                descripcion: "TrainingDescription",
            }
            await training.create(newTraining, idTest);


            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newTraining.nombre, idTest],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idElem = res.idelemento;

            query = {
                text: "SELECT nombre, descripcion, idUsuario \
                        FROM elementos \
                        WHERE idElemento = $1",
                values: [idElem],
            };
            res = (await dbCtrl.execute(query)).rows[0];            
            assert.equal(newTraining.nombre, res.nombre);
            assert.equal(newTraining.descripcion, res.descripcion);
            assert.equal(idTest, res.idusuario);
        });
    });
    describe("delete function", function() {
        beforeEach(async function() {
            await dbCtrl.execute("DELETE FROM usuarios");
            await dbCtrl.execute("DELETE FROM elementos");
            await dbCtrl.execute("DELETE FROM entrenamientos");
        });
        
        it("should return training deleted correctly", async function() {
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);

            let query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let res = (await dbCtrl.execute(query)).rows[0];
            idTest = res.id; 

            let newTraining = {
                nombre: "TrainingTest",
                descripcion: "TrainingDescription",
            }
            await training.create(newTraining, idTest);


            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newTraining.nombre, idTest],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idElem = res.idelemento;

            await training.del(idElem);

            query = {
                text: "SELECT * \
                        FROM entrenamientos" ,
            };
            res = (await dbCtrl.execute(query)).rows;
            assert.equal(res.length, 0);

            query = {
                text: "SELECT * \
                        FROM elementos" ,
            };
            res = (await dbCtrl.execute(query)).rows;
            assert.equal(res.length, 0);
        });
    });
});