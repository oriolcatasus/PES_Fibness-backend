const dbCtrl = require("../ctrls/dbCtrl");
const exercise = require('../models/exerciseModel.js')

async function del(idElemento) {
    const query = {
        text: "DELETE FROM elementos WHERE idElemento = $1",
        values: [idElemento]
    }
    await dbCtrl.execute(query);
}

async function create(training) {
    //create the element
    let query = {
        text: "INSERT INTO elementos(nombre, descripcion, idUsuario) values($1, $2, $3)",
        values: [training.nombre, training.descripcion, training.idUser]
    }
    await dbCtrl.execute(query);

    //get the automatically generated id of the element (that will be referred from training)
    const queryGetID = {
        text: "SELECT idElemento \
                FROM elementos \
                WHERE nombre = $1 and idUsuario = $2",
        values: [training.nombre, training.idUser],
    };
    const res = (await dbCtrl.execute(queryGetID)).rows;
    const idElem = res[0].idelemento;

    //create training
    query = {
        text: "INSERT INTO entrenamientos(idElemento) values($1)",
        values: [idElem],
    }
    await dbCtrl.execute(query);
    const ret = {
        idElemento: idElem,
    }
    return ret;
}

async function update(elemento, idElemento) {
    const query = {
        text: "UPDATE elementos SET nombre = $2 ,descripcion = $3 WHERE idElemento = $1",
        values: [idElemento, elemento.nombre, elemento.descripcion]
    }
    await dbCtrl.execute(query);
}
// For now just returns exercises but it should return also sports
async function activities(idElemento) {
    const query = {
        text: "SELECT a.idactividad, a.nombre, a.descripcion,a.tiempoejecucion , e.numsets , e.numrepeticiones , e.tiempodescanso, e.posicion\
               FROM actividades a inner join ejercicios e on a.idactividad = e.idactividad\
               WHERE a.idEntrenamiento = $1\
               ORDER BY a.idactividad",
        values: [idElemento]
    }
    const res=await dbCtrl.execute(query)
    const activitySet = [];
    for (let i=0; i<res.rows.length; ++i) {
        activitySet.push(res.rows[i]);
    }
    return activitySet;
}

async function importE(body) {
    let query = {
        text: "SELECT nombre, descripcion\
               FROM elementos\
               WHERE idElemento = $1",
        values: [body.idElement]
    }
    let res = await dbCtrl.execute(query);

    query = {
        text: "INSERT INTO elementos (nombre, descripcion, idUsuario) values($1, $2, $3) RETURNING idElemento",
        values: [res.rows[0].nombre, res.rows[0].descripcion, body.idUser]
    }
    res = await dbCtrl.execute(query);

    query = {
        text: "INSERT INTO entrenamientos (idElemento) values($1)",
        values: [res.rows[0].idelemento]
    }

    await dbCtrl.execute(query);

    body = {
        newId : res.rows[0].idelemento,
        oldId : body.idElement
    }
    await exercise.importE(body);

}


module.exports = {
    create,update,del,activities,
    importE
}
