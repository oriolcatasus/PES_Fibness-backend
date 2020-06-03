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

async function importE(body) {
    let query = {
        text: "SELECT idActividad, nombre, descripcion, tiempoEjecucion\
               FROM actividades\
               WHERE idEntrenamiento = $1",
        values: [body.oldId]
    }
    const res = await dbCtrl.execute(query)
    let res2;

    for (let i=0; i<res.rows.length; ++i) {
        query = {
            text: "SELECT numSets, numRepeticiones, tiempoDescanso, posicion\
                   FROM ejercicios\
                   WHERE idActividad = $1",
            values: [res.rows[i].idactividad]
        }
        res2 = await dbCtrl.execute(query);

        const exercise = {
            nombre: res.rows[i].nombre,
            descripcion: res.rows[i].descripcion,
            tiempoEjecucion: res.rows[i].tiempoejecucion,
            idEntrenamiento: body.newId,
            numSets: res2.rows[0].numsets,
            numRepeticiones: res2.rows[0].numrepeticiones,
            tiempoDescanso: res2.rows[0].tiempodescanso,
            posicion: res2.rows[0].posicion
        }

        await create(exercise);
    }

}

module.exports = {
    create,
    update,
    del,
    importE
}
