const SQL = require('sql-template-strings')

const dbCtrl = require("../ctrls/dbCtrl");

async function create(routes) {
    //dstrecorrida en estadisticas esta como strings
    let query = SQL `SELECT * FROM estadisticas WHERE idUsuario=${routes.idUser} and fecha=CURRENT_DATE`;
    query = (await dbCtrl.execute(query)).rows;
    let status  = 0;
    if (query.length === 0){
        const createquery = SQL `INSERT INTO estadisticas(idUsuario, dstRecorrida) values(${routes.idUser},${routes.dstRecorrida})`;
        await dbCtrl.execute(createquery);
        status = 201;
    }
    else{
        let dstrecorridatotal = parseInt(query[0].dstrecorrida)
        dstrecorridatotal += parseInt(routes.dstRecorrida);
        dstrecorridatotal = dstrecorridatotal.toString();
        const updatequery = SQL `UPDATE estadisticas SET dstRecorrida=${dstrecorridatotal} WHERE idUsuario=${routes.idUser} and fecha=CURRENT_DATE `;
        await dbCtrl.execute(updatequery);
        status = 200;
    }
    //dstrecorrida de usuarios esta en enteros
    const getglobaldstRecorrida = SQL `SELECT dstrecorrida FROM usuarios WHERE id=${routes.idUser}`
    let dstGlobal = (await dbCtrl.execute(getglobaldstRecorrida)).rows[0].dstrecorrida;
    dstGlobal += parseInt(routes.dstRecorrida);
    const updatequeryglobaldstRecorrida = SQL `UPDATE usuarios SET dstrecorrida = ${dstGlobal} WHERE id=${routes.idUser}`
    await dbCtrl.execute(updatequeryglobaldstRecorrida);
    return status;
}
module.exports = {
    create,
}
