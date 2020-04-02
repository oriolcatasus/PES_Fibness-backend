const assert = require("assert");

const user = require("../src/models/userModel");
const diet = require("../src/models/dietModel");
const dbCtrl = require("../src/ctrls/dbCtrl");

const dbConfig = require("../db/config/integrationdb_config");

describe("dietModel script", function() {
    before(async function() {
        dbCtrl.connect(dbConfig);
    });
    describe("create function", function() {
        beforeEach(async function() {
            await dbCtrl.execute("DELETE FROM usuarios");
            await dbCtrl.execute("DELETE FROM elementos");
            await dbCtrl.execute("DELETE FROM dietas");
        });

        it("should return diet created correctly", async function() {
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

            //create diet (and element)
            let newDiet = {
                nombre: "TrainingDiet",
                descripcion: "DietDescription",
                idUser: idTest,
            }
            await diet.create(newDiet);

            //get the automatically generated id for the diet in order to access it
            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newDiet.nombre, idTest],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idElem = res.idelemento;

            //get the diet that we have created
            query = {
                text: "SELECT nombre, descripcion, idUsuario \
                        FROM elementos \
                        WHERE idElemento = $1",
                values: [idElem],
            };

            //make sure it really is the diet we created
            res = (await dbCtrl.execute(query)).rows[0];            
            assert.equal(newDiet.nombre, res.nombre);
            assert.equal(newDiet.descripcion, res.descripcion);
            assert.equal(idTest, res.idusuario);
        });

        /*it("should return unique constraint violation", async function() {
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

            //create training (and element)
            let newTraining = {
                nombre: "TrainingTest",
                descripcion: "TrainingDescription",
                idUser: idTest,
            }
            await training.create(newTraining);

            //create training (and element) with same name and idUser, which violates unique constraint
            newTraining = {
                nombre: "TrainingTest",
                descripcion: "TrainingDescription2",
                idUser: idTest,
            }
            assert.rejects(() => training.create(newUser), Error);
        });*/
    });
    after(async function() {
        await dbCtrl.disconnect();
    });
});