const SQL = require('sql-template-strings')

const dbCtrl = require("../ctrls/dbCtrl");

async function create(aliment) {
    //create the element
    const query = SQL`INSERT INTO alimentos(nombre, descripcion, calorias, idComida)
        values(${aliment.nombre}, ${aliment.descripcion}, ${aliment.calorias}, ${aliment.idComida})
        RETURNING idAlimento`
    const idAliment = (await dbCtrl.execute(query)).rows[0].idalimento;
    return {
        idAlimento: idAliment,
    }
}

async function del(idAlimento) {
    const query = SQL`DELETE FROM alimentos
        WHERE idAlimento = ${idAlimento}`
    await dbCtrl.execute(query);
}

async function update(newAlimento, idAlimento) {
    const query = SQL`UPDATE alimentos
        SET nombre = ${newAlimento.nombre}, descripcion = ${newAlimento.descripcion}, calorias = ${newAlimento.calorias}
        WHERE idAlimento = ${idAlimento}`
    await dbCtrl.execute(query);
}

module.exports = {
    create, del, update
}
