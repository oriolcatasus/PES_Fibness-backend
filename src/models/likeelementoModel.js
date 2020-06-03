const SQL = require('sql-template-strings')

const dbCtrl = require("../ctrls/dbCtrl")

async function liked(idElemento, idUser) {
    const query = {
        text: 'SELECT * \
                FROM likesElementos \
                WHERE idUsuario = $1 AND idElemento = $2',
        values: [idUser, idElemento]
    };

    const res = (await dbCtrl.execute(query)).rows;
    console.log(idUser, idElemento)

    let elementLiked = true
    if (res.length == 0) {
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
