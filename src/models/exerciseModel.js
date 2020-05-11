const SQL = require('sql-template-strings')

const dbCtrl = require("../ctrls/dbCtrl");

async function create(exercise) {
    //create the activity
    let query = SQL`INSERT INTO actividades(nombre, descripcion, tiempoejecucion,idEntrenamiento)
        values(${exercise.nombre}, ${exercise.descripcion}, ${exercise.tiempoEjecucion}, ${exercise.idEntrenamiento})`
    await dbCtrl.execute(query);

    //get the automatically generated id of the activity (that will be referred from exercise)
    //there can be repeticions in the name but we know that the higher id related to name and idelemento
    // is the  last created by the user
    query = SQL`SELECT MAX(idActividad) as idactividad
        FROM actividades
        WHERE nombre=${exercise.nombre} and idEntrenamiento=${exercise.idEntrenamiento}`
    const res = (await dbCtrl.execute(query)).rows;
    const idActividad = res[0].idactividad;
    //create exercise
    query = SQL`INSERT INTO ejercicios(idactividad, numsets, numrepeticiones, tiempodescanso, posicion)
        values(${idActividad}, ${exercise.numSets}, ${exercise.numRepeticiones}, ${exercise.tiempoDescanso},${exercise.posicion})`
    await dbCtrl.execute(query);
    return {
        idExercise: idActividad,
    }
}

async function update(exercise, idActividad) {
    let query = SQL`UPDATE actividades
        SET nombre=${exercise.nombre} ,descripcion=${exercise.descripcion}, tiempoejecucion=${exercise.tiempoEjecucion}
        WHERE idactividad = ${idActividad}`
    await dbCtrl.execute(query);

    query = SQL`UPDATE ejercicios
        SET numsets=${exercise.numSets}, numrepeticiones=${exercise.numRepeticiones},
            tiempodescanso=${exercise.tiempoDescanso}, posicion=${exercise.posicion}
        WHERE idactividad = ${idActividad}`
    await dbCtrl.execute(query);
}


async function del(idActividad) {
    const query = SQL`DELETE FROM actividades WHERE idActividad = ${idActividad}`
    await dbCtrl.execute(query);
}

module.exports = {
    create,
    update,
    del
}
