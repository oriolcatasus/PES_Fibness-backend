const SQL = require('sql-template-strings')

const dbCtrl = require("../ctrls/dbCtrl")

async function comment(body) {
    let query = SQL`INSERT INTO comentarios(idUsuario, idElemento, texto)
        values(${body.idUser}, ${body.idElement}, ${body.text}) RETURNING idComentario`;
    res = await dbCtrl.execute(query);
    result = {
        idCom: res.rows[0].idcomentario
    }
    
    query = SQL`UPDATE elementos SET nComentarios = nComentarios + 1
        WHERE idElemento = ${body.idElement}`;
    await dbCtrl.execute(query);

    return result;
}

async function delComment(idComment) {
    let query = SQL`SELECT idElemento FROM comentarios WHERE idComentario = ${idComment}`;
    idElem = (await dbCtrl.execute(query)).rows[0].idelemento;

    query = SQL`DELETE FROM comentarios WHERE idComentario = ${idComment}`;
    await dbCtrl.execute(query);

    query = SQL`UPDATE elementos SET nComentarios = nComentarios - 1
        WHERE idElemento = ${idElem}`;
    await dbCtrl.execute(query);
}

async function comments(idElemento) {
    const query = {
        text: "SELECT idComentario, idUsuario, fecha, texto, nLikes\
               FROM comentarios\
               WHERE idElemento = $1\
               ORDER BY fecha",
        values: [idElemento]
    }
    const res = await dbCtrl.execute(query)
    const c = [];
    for (let i=0; i<res.rows.length; ++i) {
        c.push(res.rows[i]);
    }
    return c;
}

module.exports = {
    comment,
    delComment,
    comments,
}
