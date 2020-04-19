const dbCtrl = require("../ctrls/dbCtrl");

async function create(exercise) {
    //create the activity
    let queryCreateActivity = {
        text: "INSERT INTO actividades(nombre, descripcion, tiempoejecucion,idEntrenamiento) values($1, $2, $3, $4)",
        values: [exercise.nombre, exercise.descripcion, exercise.tiempoejecucion, exercise.idEntrenamiento]
    }
    await dbCtrl.execute(queryCreateActivity);

    //get the automatically generated id of the activity (that will be referred from exercise)
    //there can be repeticions in the name but we know that the higher id related to name and idelemento
    // is the  last created by the user
    let queryGetID = {
        text: "SELECT MAX(idActividad)\
                FROM actividades \
                WHERE nombre = $1 and idEntrenamiento = $2",
        values: [exercise.nombre, exercise.idEntrenamiento],
    };
    let res = (await dbCtrl.execute(queryGetID)).rows;
    let idActividad = res[0].idActividad;

    //create exercise
    query = {
        text: "INSERT INTO ejercicios(idActividad,numSets,numRepeticiones,tiempoDescanso) values($1,$2,$3,$4)",
        values: [idActividad, exercise.numSets, exercise.numRepeticiones, exercise.tiempoDescanso],
    }
    await dbCtrl.execute(query);
    return idActividad;
}

async function update(exercise, idActividad) {
    let queryUpdateActivity = {
        text: "UPDATE actividades SET nombre = $2 ,descripcion = $3 , tiempoejecucion = $4, WHERE idActividad = $1",
        values: [idActividad, exercise.nombre, exercise.descripcion,exercise.tiempoejecucion]
    }
    await dbCtrl.execute(queryUpdateActivity);

    let queryUpdateExercise = {
        text: "UPDATE ejercicios SET numSets = $1, numRepeticiones = $3, tiempoDescanso = $4 WHERE idActividad = $1",
        values: [idActividad, exercise.numSets,exercise.numRepeticiones,exercise.tiempoDescanso],
    }
    await dbCtrl.execute(queryUpdateExercise);
}


async function del(idActividad) {
    let query = {
        text: "DELETE FROM actividad WHERE idActividad = $1",
        values: [idActividad]
    }
    await dbCtrl.execute(query);
}

module.exports = {
    create,update,del
}