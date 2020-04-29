const dbCtrl = require("../ctrls/dbCtrl");

async function create(exercise) {
    //create the activity
    const queryCreateActivity = {
        text: "INSERT INTO actividades(nombre, descripcion, tiempoejecucion,idEntrenamiento) values($1, $2, $3, $4)",
        values: [exercise.nombre, exercise.descripcion, exercise.tiempoEjecucion, exercise.idEntrenamiento]
    }
    await dbCtrl.execute(queryCreateActivity);

    //get the automatically generated id of the activity (that will be referred from exercise)
    //there can be repeticions in the name but we know that the higher id related to name and idelemento
    // is the  last created by the user
    const queryGetID = {
        text: " SELECT MAX(idActividad) as idactividad\
                FROM actividades \
                WHERE nombre = $1 and idEntrenamiento = $2",
        values: [exercise.nombre, exercise.idEntrenamiento],
    };
    const res = (await dbCtrl.execute(queryGetID)).rows;
    const idActividad = res[0].idactividad;
    //create exercise
    const query = {
        text: "INSERT INTO ejercicios(idactividad,numsets,numrepeticiones,tiempodescanso) values($1,$2,$3,$4)",
        values: [idActividad, exercise.numSets, exercise.numRepeticiones, exercise.tiempoDescanso],
    }
    await dbCtrl.execute(query);
    let ret = {
        idExercise: idActividad,
    }
    return ret;
}

async function update(exercise, idActividad) {

    const queryUpdateActivity = {
        text: "UPDATE actividades SET nombre = $2 ,descripcion = $3 , tiempoejecucion = $4 WHERE idactividad = $1",
        values: [idActividad, exercise.nombre, exercise.descripcion,exercise.tiempoEjecucion]
    }
    await dbCtrl.execute(queryUpdateActivity);

    const queryUpdateExercise = {
        text: "UPDATE ejercicios SET numsets = $2, numrepeticiones = $3, tiempodescanso = $4 WHERE idactividad = $1",
        values: [idActividad, exercise.numSets,exercise.numRepeticiones,exercise.tiempoDescanso],
    }
    await dbCtrl.execute(queryUpdateExercise);

}


async function del(idActividad) {

    const query = {
        text: "DELETE FROM actividades WHERE idActividad = $1",
        values: [idActividad]
    }
    await dbCtrl.execute(query);

}

module.exports = {
    create,update,del
}
