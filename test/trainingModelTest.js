const assert = require("assert");

const user = require("../src/models/userModel");
const dbCtrl = require("../src/ctrls/dbCtrl");

describe("userModel script", function() {
    describe("create function", function() {
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
                text: "SELECT idUsuario \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let idTest = (await dbCtrl.execute(query)).rows[0].idUsuario; 

            let newTraining = {
                nombre: "TrainingTest",
                descripcion: "TrainingDescription",
                idUsuario: idTest,
            }
            await training.add(newTraining);

            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newTraining.nombreElemento, newTraining.idUsuario],
            };
            let idElem = (await dbCtrl.execute(queryGetID)).rows[0].idelemento;

            query = {
                text: "SELECT nombre, descripcion, idUsuario \
                        FROM elementos \
                        WHERE idElemento = $1",
                values: [idElem],
            };
            let res = (await dbCtrl.execute(query)).rows[0];            
            assert.equal(newTraining.nombre, res.nombre);
            assert.equal(newTraining.descripcion, res.descripcion);
            assert.equal(newTraining.idUsuaio, res.idusuario);
        });
    });
});