const assert = require("assert");

const user = require("../../src/models/userModel");
const training = require("../../src/models/trainingModel");
const dbCtrl = require("../../src/ctrls/dbCtrl");

require("../rootHooks");

describe("trainingModel script", function() {
    
    describe("create function", function() {

        it("should return training created correctly", async function() {
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

            //get the automatically generated id for the training in order to access it
            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newTraining.nombre, idTest],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idElem = res.idelemento;

            //get the training that we have created
            query = {
                text: "SELECT nombre, descripcion, idUsuario \
                        FROM elementos \
                        WHERE idElemento = $1",
                values: [idElem],
            };

            //make sure it really is the training we created
            res = (await dbCtrl.execute(query)).rows[0];            
            assert.equal(newTraining.nombre, res.nombre);
            assert.equal(newTraining.descripcion, res.descripcion);
            assert.equal(idTest, res.idusuario);

            //same as above but with training
            query = {
                text: "SELECT idElemento \
                        FROM entrenamientos \
                        WHERE idElemento = $1",
                values: [idElem],
            };
            res = (await dbCtrl.execute(query)).rows[0]; 
            assert.equal(idElem, res.idelemento);
        });

        it("should return unique constraint violation", async function() {
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
            assert.rejects(() => training.create(newTraining), Error);
        });
    });
    describe("delete function", function() {
        
        it("should return training deleted correctly", async function() {
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

            //get the automatically generated id for the training in order to access it
            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newTraining.nombre, idTest],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idElem = res.idelemento;

            //deletion of the training
            await training.del(idElem);

            //making sure neither the training nor the element exist
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
    describe("update function", function() {
        
        it("should return training update correctly", async function() {

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
            
            //get the automatically generated id for the training in order to access it
            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newTraining.nombre, idTest],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idElem = res.idelemento;
            
            let modifiedTraining = {
                nombre: "Training_Test",
                descripcion: "Training_Description",
            }

            //update training
            await training.update(modifiedTraining, idElem);

            //get the modified training
            query = {
                text: "SELECT nombre, descripcion, idUsuario \
                        FROM elementos \
                        WHERE idElemento = $1",
                values: [idElem],
            };
            res = (await dbCtrl.execute(query)).rows[0];    

            //make sure the modifications have been made
            assert.equal(modifiedTraining.nombre, res.nombre);
            assert.equal(modifiedTraining.descripcion, res.descripcion);
            assert.equal(newTraining.idUser, res.idusuario);
        });
    });
});