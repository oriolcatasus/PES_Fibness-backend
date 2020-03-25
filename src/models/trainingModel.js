const dbCtrl = require("../ctrls/dbCtrl");

async function del(nombre) {
    let query = {
        text: "DELETE FROM elementos WHERE nombre = $1",
        values: [nombre]
    }
    await dbCtrl.execute(query);
}

async function add(training) {
    let query = {
        text: "INSERT INTO elementos(nombre, descripcion, idUsuario) values($1, $2, $3)",
        values: [training.nombreElemento, training.descripcion, training.idUsuario]
    }
    await dbCtrl.execute(query);

    let queryGetID = {
        text: "SELECT idElemento \
                FROM elementos \
                WHERE nombre = $1 and idUsuario = $2",
        values: [training.nombreElemento, training.idUsuario],
    };
    console.log(queryGetID);
    let idElem = (await dbCtrl.execute(queryGetID)).rows[0].idelemento;
    console.log(idElem);
    
    query = {
        text: "INSERT INTO entrenamientos(idElemento) values($1)",
        values: [idElem],
    }
    await dbCtrl.execute(query);
}

module.exports = {
    del,
    add
}