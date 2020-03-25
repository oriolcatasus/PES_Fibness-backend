const dbCtrl = require("../ctrls/dbCtrl");

async function create(elemento) {
    let query = {
        text: "INSERT INTO elementos(nombre,descripcion) VALUES ($1, $2, $3)",
        values: [elemento.nombre, elemento.descripcion]
    }
    await dbCtrl.execute(query);
}

async function update(elemento ) {
    let query = {
        text: "UPDATE TABLE FROM elementos WHERE idElemento = $1 SET nombre = $2 ,descripcion = $3",
        values: [elemento.idElemento,elemento.nombre,elemnto.descripcion]
    }
    await dbCtrl.execute(query);
}

async function del(elemento) {
    let query = {
        text: "DELETE FROM elementos WHERE nombre = $1",
        values: [elemento.idElemento]
    }
    await dbCtrl.execute(query);
}

module.exports = {
    create,update,del
}