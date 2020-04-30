const SQL = require('sql-template-strings')

const dbCtrl = require("../ctrls/dbCtrl");

async function create(diet) {
    //create the element
    let query = SQL`INSERT INTO elementos(nombre, descripcion, idUsuario)
        values(${diet.nombre}, ${diet.descripcion}, ${diet.idUser})`
    await dbCtrl.execute(query);

    //get the automatically generated id of the element (that will be referred from diet)
    query = SQL`SELECT idElemento
        FROM elementos
        WHERE nombre=${diet.nombre} and idUsuario=${diet.idUser}`
    const res = (await dbCtrl.execute(query)).rows;
    const idElemento = res[0].idelemento;

    //create diet
    query = SQL`INSERT INTO dietas(idElemento) values(${idElemento})`
    await dbCtrl.execute(query);


    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    for(day of days) {
        query = SQL`INSERT INTO diasDieta(idElemento, tipoDia)
            values (${idElemento}, ${day})`
        await dbCtrl.execute(query);
    }
    return {
        idElemento
    }
}

async function del(idElemento) {
    const query = SQL`DELETE FROM elementos
        WHERE idElemento = ${idElemento}`
    await dbCtrl.execute(query);
}

async function update(elemento, idElemento) {
    const query = SQL`UPDATE elementos
        SET nombre = ${elemento.nombre} ,descripcion = ${elemento.descripcion}
        WHERE idElemento = ${idElemento}`
    await dbCtrl.execute(query);
}

async function dayMeals(idElemento, day) {
    const query = SQL`SELECT idComida, nombre, horaComida
        FROM comidas
        WHERE idElemento = ${idElemento} AND tipoDia = ${day}
        ORDER BY horaComida`
    return (await dbCtrl.execute(query)).rows;
}

module.exports = {
    create,
    del,
    update,
    dayMeals
}
