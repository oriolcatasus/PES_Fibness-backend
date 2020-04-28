const dbCtrl = require("../ctrls/dbCtrl");

async function del(idElemento) {
    let query = {
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
    let queryGetID = {
        text: "SELECT idElemento \
                FROM elementos \
                WHERE nombre = $1 and idUsuario = $2",
        values: [training.nombre, training.idUser],
    };
    let res = (await dbCtrl.execute(queryGetID)).rows;
    let idElem = res[0].idelemento;

    //create training
    query = {
        text: "INSERT INTO entrenamientos(idElemento) values($1)",
        values: [idElem],
    }
    await dbCtrl.execute(query);
    let ret = {
        idElemento: idElem,
    }
    return ret;
}

async function update(elemento, idElemento) {
    let query = {
        text: "UPDATE elementos SET nombre = $2 ,descripcion = $3 WHERE idElemento = $1",
        values: [idElemento, elemento.nombre, elemento.descripcion]
    }
    await dbCtrl.execute(query);
}
// For now just returns exercises but it should return also sports
async function activities(idElemento) {
    
    let query = {
        text: "SELECT a.idactividad AS idActividad, a.nombre, a.descripcion,a.tiempoejecucion AS tiempoEjecucion, e.numsets AS numSets, e.numrepeticiones AS numRepeticiones, e.tiempodescanso AS tiempoDescanso\
               FROM actividades a inner join ejercicios e on a.idactividad = e.idactividad\
               WHERE a.idEntrenamiento = $1",
        values: [idElemento]
    }

    res=await dbCtrl.execute(query)
    let activitySet = [];
    for (i=0; i<res.rows.length; ++i) {
        activitySet.push(res.rows[i]);
    }
    return activitySet;
}


module.exports = {
    create,update,del,activities
}