const dbCtrl = require("../ctrls/dbCtrl");

async function create(meal) {
    //create the meal
    const query = {
        text: "INSERT INTO comidas(nombre, horaComida, idElemento, tipoDia) values($1, $2, $3, $4) RETURNING idComida",
        values: [meal.nombre, meal.horaComida, meal.idElemento, meal.tipoDia]
    }
    const idMeal = (await dbCtrl.execute(query)).rows[0].idcomida;
    const ret = {
        idComida: idMeal,
    }
    return ret;

}

async function del(idComida) {
    const query = {
        text: "DELETE FROM comidas WHERE idComida = $1",
        values: [idComida]
    }
    await dbCtrl.execute(query);
}

async function update(newComida, idComida) {
    const query = {
        text: "UPDATE comidas SET nombre = $2 ,horaComida = $3 WHERE idComida = $1",
        values: [idComida, newComida.nombre, newComida.horaComida]
    }
    await dbCtrl.execute(query);
}

async function aliments(idComida) {
    const query = {
        text: "SELECT idAlimento, nombre, descripcion, calorias \
               FROM alimentos\
               WHERE idComida = $1 \
               ORDER BY idAlimento ASC",
        values: [idComida]
    }
    const res = (await dbCtrl.execute(query));
    const alimentsSet = [];
    for (let i=0; i<res.rows.length; ++i) {
        alimentsSet.push(res.rows[i]);
    }
    return alimentsSet;
}

module.exports = {
    create, del, update, aliments
}
