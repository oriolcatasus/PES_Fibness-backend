const SQL = require('sql-template-strings')

const dbCtrl = require("../ctrls/dbCtrl");

async function create(routes) {
    //create the element
    let query = SQL`INSERT INTO elementos(nombre, descripcion, idUsuario)
        values(${routes.nombre}, ${routes.descripcion}, ${routes.idUser})`
    await dbCtrl.execute(query);

    //get the automatically generated id of the element (that will be referred from routes)
    query = SQL`SELECT idElemento
        FROM elementos
        WHERE nombre=${routes.nombre} and idUsuario=${routes.idUser}`
    const res = (await dbCtrl.execute(query)).rows;
    const idElemento = res[0].idelemento;

    //create routes
    query = SQL`INSERT INTO rutas(idElemento, origen, destino, distancia) values(${idElemento},${routes.origen},${routes.destino},${routes.distancia})`
    await dbCtrl.execute(query);
    
    const ret = {
        idElemento: idElemento,
    }
    return ret;
    /*
    stops = routes.stops
    for(const stops of stops)
        query = SQL`INSERT INTO paradas(idElemento, coordenada)
            values (${idElemento}, ${coordinate})`
        await dbCtrl.execute(query);
    }
    return {
        idElemento
    }
    */
    /*
    create table paradas(
        coordenada varchar(50),
        idElemento int,
        primary key (idElemento,coordenada),
        foreign key (idElemento) references rutas (idElemento) on delete cascade
    );
    RT: La coordenada de una parada no puede ser igual a la cordenada de origen o destino de la ruta  a la que pertenece
    */
}

async function del(idElemento) {
    const query = SQL`DELETE FROM elementos
        WHERE idElemento = ${idElemento}`
    await dbCtrl.execute(query);
}

async function update(routes, idElemento) {
    console.log("The new content of the route is:")
    console.log(routes)
    const query_elemento = SQL`UPDATE elementos
        SET nombre = ${routes.nombre} ,descripcion = ${routes.descripcion}
        WHERE idElemento = ${idElemento}`
    await dbCtrl.execute(query_elemento);
    console.log("the update of the ELEMENT went well");
    
    const query_route = SQL `UPDATE rutas
        SET origen = ${routes.origen}, destino = ${routes.destino}, distancia = ${routes.distancia}
        WHERE idElemento = ${idElemento}`
    await dbCtrl.execute(query_route);
    console.log("The update of the ROUTE went well") 
}


module.exports = {
    create,
    del,
    update
}
