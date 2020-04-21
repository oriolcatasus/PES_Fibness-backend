const dbCtrl = require("../ctrls/dbCtrl");

async function create(meal) {
    //create the meal
    let query = {
        text: "INSERT INTO comidas(nombre, horaComida, idElemento, tipoDia) values($1, $2, $3, $4) RETURNING idComida",
        values: [meal.nombre, meal.horaComida, meal.idElemento, meal.tipoDia]
    }
    idMeal = (await dbCtrl.execute(query)).rows[0].idcomida;
    let ret = {
        idComida: idMeal,
    }
    return ret;

}

async function del(idComida) {
    let query = {
        text: "DELETE FROM comidas WHERE idComida = $1",
        values: [idComida]
    }
    await dbCtrl.execute(query);
}

async function update(newComida, idComida) {
    let query = {
        text: "UPDATE comidas SET nombre = $2 ,horaComida = $3 WHERE idComida = $1",
        values: [idComida, newComida.nombre, newComida.horaComida]
    }
    await dbCtrl.execute(query);
}

async function aliments(idComida) {
    let query = {
        text: "SELECT idAlimento, nombre, descripcion, calorias \
               FROM alimentos\
               WHERE idComida = $1",
        values: [idComida]
    }
    res = (await dbCtrl.execute(query));
    let alimentsSet = [];
    for (i=0; i<res.rows.length; ++i) {
        alimentsSet.push(res.rows[i]);
    }
    return alimentsSet;
}

module.exports = {
    create, del, update, aliments
}