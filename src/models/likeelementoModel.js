const SQL = require('sql-template-strings')

const dbCtrl = require("../ctrls/dbCtrl")

async function liked(idElemento, idUser) {
    let query = SQL`SELECT *
                    FROM likesElementos
                    WHERE idElemento = ${idElemento} AND idUsuario = ${idUser}`
    const res = await dbCtrl.execute(query);
    console.log(idUser, idElemento)

    let elementLiked = true
    if (res.rows.length == 0) {
        elementLiked = false
    }
    const result = {
        like: elementLiked
    }
    console.log(result);
    return result;
}

module.exports = {
    liked,
}
