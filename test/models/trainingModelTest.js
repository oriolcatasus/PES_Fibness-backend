const assert = require("assert");

const user = require("../../src/models/userModel");
const training = require("../../src/models/trainingModel");
const dbCtrl = require("../../src/ctrls/dbCtrl");
const exercise = require("../../src/models/exerciseModel");
const comment = require("../../src/models/commentModel");

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
            let idElem_resp = (await training.create(newTraining)).idElemento;

            //get the automatically generated id for the training in order to access it
            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newTraining.nombre, idTest],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idElem = res.idelemento;
            assert.equal(idElem_resp,idElem);
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
    describe("get operation", function() {

        it("should return set of exercises correctly", async function(){
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
            let idTest = res.id; 

            //create training  (and element)
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
            idTrainigTest = res.idelemento;
            //Exercise 1
            let newExercise = {
                nombre: "exerciseTest",
                descripcion: "exerciseDescription",
                tiempoEjecucion: 4,
                idEntrenamiento: idTrainigTest,
                numSets: 3,
                numRepeticiones: 2,
                tiempoDescanso: 1,
                posicion:3,
            }
            await exercise.create(newExercise);
            //Exercise 2
            let newExercise2 = {
                nombre: 'exercise_Test',
                descripcion: 'exercise_Description',
                tiempoEjecucion: 5,
                idEntrenamiento: idTrainigTest,
                numSets: 4,
                numRepeticiones: 3,
                tiempoDescanso: 2,
                posicion:4,
            }
            await exercise.create(newExercise2);

            let trainingSet = await training.activities(idTrainigTest);
            assert.equal(trainingSet[0].nombre, newExercise.nombre);
            assert.equal(trainingSet[0].descripcion, newExercise.descripcion);
            assert.equal(trainingSet[0].tiempoejecucion, newExercise.tiempoEjecucion);
            assert.equal(trainingSet[0].numsets, newExercise.numSets);
            assert.equal(trainingSet[0].numrepeticiones, newExercise.numRepeticiones);
            assert.equal(trainingSet[0].tiempodescanso, newExercise.tiempoDescanso);
            assert.equal(trainingSet[0].posicion, newExercise.posicion);
            assert.equal(trainingSet[1].nombre, newExercise2.nombre);
            assert.equal(trainingSet[1].descripcion, newExercise2.descripcion);
            assert.equal(trainingSet[1].tiempoejecucion, newExercise2.tiempoEjecucion);
            assert.equal(trainingSet[1].numsets, newExercise2.numSets);
            assert.equal(trainingSet[1].numrepeticiones, newExercise2.numRepeticiones);
            assert.equal(trainingSet[1].tiempodescanso, newExercise2.tiempoDescanso);
            assert.equal(trainingSet[1].posicion, newExercise2.posicion);
            
        });

    });

    describe("comment operations", function() {
        it("should return set of comments correctly", async function(){
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
            let idTest = res.id; 

            //create training  (and element)
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
            idTrainingTest = res.idelemento;

            let body = {
                idUser: idTest,
                idElement: idTrainingTest,
                text: "primer comentario"
            }
            await comment.comment(body);

            body = {
                idUser: idTest,
                idElement: idTrainingTest,
                text: "segundo comentario"
            }

            await comment.comment(body);
            const commentSet = await comment.comments(idTrainingTest);
            assert.equal(commentSet[0].idusuario, body.idUser);
            assert.equal(commentSet[0].texto, "primer comentario");
            assert.equal(commentSet[1].texto, "segundo comentario");
        });

    });
});