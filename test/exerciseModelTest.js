const assert = require("assert");

const user = require("../src/models/userModel");
const training = require("../src/models/trainingModel");
const exercise = require("../src/models/exerciseModel");
const dbCtrl = require("../src/ctrls/dbCtrl");

require("./rootHooks");

describe("exerciseModel script", function() {
    
    describe("create function", function() {

        it("should return exercise created correctly", async function() {
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

            //get the automatically generated id for the training
            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newTraining.nombre, idTest],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idTrainigTest = res.idelemento;

            //create exercise( and activity)
            let newExercise = {
                nombre: "exerciseTest",
                descripcion: "exerciseDescription",
                tiempoEjecucion: 4,
                idEntrenamiento: idTrainigTest,
                numSets: 3,
                numRepeticiones: 2,
                tiempoDescanso: 1,
            }
            await exercise.create(newExercise);

            //get the automatically generated id for the exercise in order to access it
            let queryGetID = {
                text: "SELECT MAX(idActividad) \
                        FROM actividades \
                        WHERE nombre = $1 and idEntrenamiento = $2",
                values: [newExercise.nombre,newExercise.idEntrenamiento],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idActi = res.idActividad;

            //get the activity that we have created
            queryGetActivity = {
                text: "(SELECT nombre, descripcion,tiempoEjecucion, idEntrenamiento \
                        FROM actividades \
                        WHERE idActividad = $1)",
                values: [idActi],
            };
            
            resAct = (await dbCtrl.execute(queryGetActivity)).rows[0]

            //make sure is really the activity we created
            assert.equal(newExercise.nombre, resAct.nombre);
            assert.equal(newExercise.descripcion, resAct.descripcion);
            assert.equal(newExercise.tiempoEjecucion, resAct.tiempoEjecucion);
            assert.equal(newExercise.idEntrenamiento, resAct.idEntrenamiento);

            //get the exercise that we have created
            queryGetExercise = {
                text: "(SELECT idActividad,numsets,numRepeticiones,tiempoDescanso \
                        FROM exercises \
                        WHERE idActividad = $1)",
                values: [idActi],
            };
            resExer = (await dbCtrl.execute(query)).rows[0];            
            
            
            //make sure it really is the exercise we have created
            assert.equal(newExercise.numSets, resExer.numSets);
            assert.equal(newExercise.numRepeticiones, resExer.numRepeticiones);
            assert.equal(newExercise.tiempoDescanso, resExer.tiempoDescanso);
            assert.equal(idActi,resExer.idActividad);
        });


    describe("delete function", function() {
        
        it("should return exercise deleted correctly", async function() {
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
            idTrainigTest = res.idelemento;

            //create exercise( and activity)
            let newExercise = {
                nombre: "exerciseTest",
                descripcion: "exerciseDescription",
                tiempoEjecucion: 4,
                idEntrenamiento: idTrainigTest,
                numSets: 3,
                numRepeticiones: 2,
                tiempoDescanso: 1,
            }
            await exercise.create(newExercise);

            //get the automatically generated id for the exercise in order to access it
            let queryGetID = {
                text: "SELECT MAX(idActividad) \
                        FROM actividades \
                        WHERE nombre = $1 and idEntrenamiento = $2",
                values: [newExercise.nombre,newExercise.idEntrenamiento],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idActi = res.idActividad;


            //deletion of the exercise
            await exercise.del(idActi);

            //making sure neither the training nor the element exist
            query = {
                text: "SELECT * \
                        FROM actividades\
                        WHERE idActividad = $1",
                values: [idActi]
            };
            res = (await dbCtrl.execute(query)).rows;
            assert.equal(res.length, 0);

            query = {
                text: "SELECT * \
                        FROM  ejercicios\
                        WHERE idActividad = $1",
                values: [idActi]
            };
            res = (await dbCtrl.execute(query)).rows;
            assert.equal(res.length, 0);
        });
    });

    describe("update function", function() {
        
        it("should return exercise update correctly", async function() {

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
            idTrainigTest = res.idelemento;

            //create exercise( and activity)
            let newExercise = {
                nombre: "exerciseTest",
                descripcion: "exerciseDescription",
                tiempoEjecucion: 4,
                idEntrenamiento: idTrainigTest,
                numSets: 3,
                numRepeticiones: 2,
                tiempoDescanso: 1,
            }
            await exercise.create(newExercise);

            //get the automatically generated id for the exercise in order to access it
            let queryGetID = {
                text: "SELECT MAX(idActividad) \
                        FROM actividades \
                        WHERE nombre = $1 and idEntrenamiento = $2",
                values: [newExercise.nombre,newExercise.idEntrenamiento],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idActi = res.idActividad;

            let modifiedExercise = {
                nombre: "exercise_Test",
                descripcion: "exercise_Description",
                tiempoEjecucion: 5,
                idEntrenamiento: idTrainigTest,
                numSets: 4,
                numRepeticiones: 3,
                tiempoDescanso: 2,
            }

            //update training
            await training.update(modifiedExercise, idActi);

            //get the activity that we have modified
             queryGetActivity = {
                text: "(SELECT nombre, descripcion,tiempoEjecucion, idEntrenamiento \
                        FROM actividades \
                        WHERE idActividad = $1)",
                values: [idActi],
            };
            
            resAct = (await dbCtrl.execute(queryGetActivity)).rows[0]

            //make sure the changes have been made in the activity(related to the exercise)
            assert.equal(modifiedExercise.nombre, resAct.nombre);
            assert.equal(modifiedExercise.descripcion, resAct.descripcion);
            assert.equal(modifiedExercise.tiempoEjecucion, resAct.tiempoEjecucion);
            assert.equal(modifiedExercise.idEntrenamiento, resAct.idEntrenamiento);

            //get the exercise that we have modified
            queryGetExercise = {
                text: "(SELECT idActividad,numsets,numRepeticiones,tiempoDescanso \
                        FROM exercises \
                        WHERE idActividad = $1)",
                values: [idActi],
            };
            resExer = (await dbCtrl.execute(query)).rows[0];            
            
            //make sure  the changes have been made in the exercise
            assert.equal(modifiedExercise.numSets, resExer.numSets);
            assert.equal(modifiedExercise.numRepeticiones, resExer.numRepeticiones);
            assert.equal(modifiedExercise.tiempoDescanso, resExer.tiempoDescanso);
            assert.equal(idActi,resExer.idActividad);
            
        });
    });
});