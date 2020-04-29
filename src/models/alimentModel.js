const dbCtrl = require("../ctrls/dbCtrl");

async function create(aliment) {
    //create the element
    let query = {
        text: "INSERT INTO alimentos(nombre, descripcion, calorias, idComida) values($1, $2, $3, $4) RETURNING idAlimento",
        values: [aliment.nombre, aliment.descripcion, aliment.calorias, aliment.idComida]
    }
    let idAliment = (await dbCtrl.execute(query)).rows[0].idalimento;
    let ret = {
        idAlimento: idAliment,
    }
    return ret;
}

async function del(idAlimento) {
    let query = {
        text: "DELETE FROM alimentos WHERE idAlimento = $1",
        values: [idAlimento]
    }
    await dbCtrl.execute(query);
}

async function update(newAlimento, idAlimento) {
    let query = {
        text: "UPDATE alimentos SET nombre = $2 ,descripcion = $3, calorias = $4 WHERE idAlimento = $1",
        values: [idAlimento, newAlimento.nombre, newAlimento.descripcion, newAlimento.calorias]
    }
    await dbCtrl.execute(query);
}

module.exports = {
    create, del, update
}