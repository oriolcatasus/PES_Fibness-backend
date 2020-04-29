const dbCtrl = require("../ctrls/dbCtrl");

async function create(diet) {
    //create the element
    let query = {
        text: "INSERT INTO elementos(nombre, descripcion, idUsuario) values($1, $2, $3)",
        values: [diet.nombre, diet.descripcion, diet.idUser]
    }
    await dbCtrl.execute(query);

    //get the automatically generated id of the element (that will be referred from diet)
    const queryGetID = {
        text: "SELECT idElemento \
                FROM elementos \
                WHERE nombre = $1 and idUsuario = $2",
        values: [diet.nombre, diet.idUser],
    };
    const res = (await dbCtrl.execute(queryGetID)).rows;
    const idElem = res[0].idelemento;

    //create diet
    query = {
        text: "INSERT INTO dietas(idElemento) values($1)",
        values: [idElem],
    }
    await dbCtrl.execute(query);


    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    for (let i = 0; i < 7; i++) {
        const queryCreateDietDays = {
            text: "INSERT INTO diasDieta(idElemento, tipoDia) values ($1, $2)",
            values: [idElem, days[i]],
        }
        await dbCtrl.execute(queryCreateDietDays);
    }
    const ret = {
        idElemento: idElem,
    }
    return ret;

}

async function del(idElemento) {
    const query = {
        text: "DELETE FROM elementos WHERE idElemento = $1",
        values: [idElemento]
    }
    await dbCtrl.execute(query);
}

async function update(elemento, idElemento) {
    const query = {
        text: "UPDATE elementos SET nombre = $2 ,descripcion = $3 WHERE idElemento = $1",
        values: [idElemento, elemento.nombre, elemento.descripcion]
    }
    await dbCtrl.execute(query);
}

async function dayMeals(idElemento, day) {
    const query = {
        text: "SELECT idComida, nombre, horaComida \
               FROM comidas\
               WHERE idElemento = $1 AND tipoDia = $2 \
               ORDER BY horaComida",
        values: [idElemento, day]
    }
    const res = (await dbCtrl.execute(query));
    const dayMealSet = [];
    for (let i=0; i<res.rows.length; ++i) {
        dayMealSet.push(res.rows[i]);
    }
    return dayMealSet;
}

module.exports = {
    create, del, update, dayMeals
}
