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
        text: "INSERT INTO elementos(nombre, descripcion, idusuario) values($1, $2, $3)",
        values: [training.nombre, training.descripcion, training.idusuario]
    }
    await dbCtrl.execute(query);

    
}

module.exports = {
    del
}