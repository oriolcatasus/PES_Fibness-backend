const SQL = require('sql-template-strings')

const dbCtrl = require("../ctrls/dbCtrl");

async function create(routes) {
    let query = SQL `SELECT * FROM estadisticas WHERE idUsuario=${routes.idUser} and fecha=CURRENT_DATE`;
    query = (await dbCtrl.execute(query)).rows;
    if (query.length == 0){
        let createquery = SQL `INSERT INTO estadisticas(idUsuario, dstRecorrida) values(${routes.idUser},${routes.dstRecorrida})`;
        await dbCtrl.execute(createquery);
        return 201;
        
    }
    else{
        let dstrecorridatotal =  parseInt(query.dstrecorrida) + parseInt(routes.dstRecorrida);
        dstrecorridatotal = dstrecorridatotal.toString();
        let updatequery = SQL `UPDATE estadisticas SET dstRecorrida=${dstrecorridatotal} WHERE idUsuario=${routes.idUser} and fecha=CURRENT_DATE `;
        await dbCtrl.execute(updatequery);
        return 200;
    }
}
module.exports = {
    create,
}
