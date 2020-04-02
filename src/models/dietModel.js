const dbCtrl = require("../ctrls/dbCtrl");

async function create(diet) {
    //create the element
    let query = {
        text: "INSERT INTO elementos(nombre, descripcion, idUsuario) values($1, $2, $3)",
        values: [diet.nombre, diet.descripcion, diet.idUser]
    }
    await dbCtrl.execute(query);

    //get the automatically generated id of the element (that will be referred from diet)
    let queryGetID = {
        text: "SELECT idElemento \
                FROM elementos \
                WHERE nombre = $1 and idUsuario = $2",
        values: [diet.nombre, diet.idUser],
    };
    let res = (await dbCtrl.execute(queryGetID)).rows;
    let idElem = res[0].idelemento;

    //create diet
    query = {
        text: "INSERT INTO dietas(idElemento) values($1)",
        values: [idElem],
    }
    await dbCtrl.execute(query);
}



module.exports = {
    create
}