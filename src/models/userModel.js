const path = require('path')
const fs = require('fs').promises

const SQL = require('sql-template-strings')

const dbCtrl = require("../ctrls/dbCtrl")
const constants = require('../constants')
const training = require('../models/trainingModel.js')
const diet = require('../models/dietModel.js')
const route = require('../models/routeModel.js')

const userResourcePath = path.join(constants.resourcePath, 'user')


async function create(user) {
    let result;
    try {
        const query = SQL`INSERT INTO usuarios(nombre, password, email)
                        values(${user.nombre}, ${user.password}, ${user.email})
                        RETURNING id`;
        const res = await dbCtrl.execute(query);
        result = {
            created: true,
            id: res.rows[0].id
        }
    } catch(err) {
        result = {
            created: false,
            error: err.message
        }
    }
    return result;
}

async function getByEmail(email) {
    const query = SQL`SELECT *
        FROM usuarios
        WHERE email=${email}`
    const res = await dbCtrl.execute(query);
    return res.rows[0];
}

async function getById(id) {
    const query = SQL`SELECT *
        FROM usuarios
        WHERE id=${id}`
    const res = await dbCtrl.execute(query);
    return res.rows[0];
}

async function validate({email, password}) {
    const query = {
        text: "SELECT id \
                FROM usuarios \
                WHERE email = $1 AND password = $2",
        values: [email, password],
    };
    const res = await dbCtrl.execute(query);
    if (res.rows.length === 1) {
        return {
            result: true,
            id: res.rows[0].id
        }
    } else {
        return {
            result: false
        }
    }
}

async function exists(id) {
    const user = await getById(id)
    return user !== undefined
}

async function del(id) {
    const query = SQL`DELETE FROM usuarios WHERE id = ${id}`
    const userPath = path.join(userResourcePath, `${id}`)
    const promises = [
        dbCtrl.execute(query),
        fs.rmdir(userPath, {recursive: true})
    ]
    await Promise.all(promises)
}

async function routes(id) {
    const query = SQL`SELECT *
        FROM elementos e inner join rutas r on e.idelemento = r.idelemento
        WHERE e.idUsuario = ${id}
        ORDER BY e.idElemento ASC`
    const res = await dbCtrl.execute(query);
    return res.rows;
}

async function trainings(id) {
    const query = SQL`SELECT e.idElemento, e.nombre, e.descripcion, e.nLikes, e.nComentarios
        FROM elementos e
        WHERE e.idUsuario = ${id} AND EXISTS
            (SELECT *
            FROM entrenamientos
            WHERE idElemento = e.idElemento)
        ORDER BY e.idElemento ASC`
    const res = await dbCtrl.execute(query);
    return res.rows;
}

async function diets(id) {
    const query = SQL`SELECT e.idElemento, e.nombre, e.descripcion, e.nLikes, e.nComentarios
        FROM elementos e
        WHERE e.idUsuario = ${id} AND EXISTS
            (SELECT *
            FROM dietas
            WHERE idElemento = e.idElemento)
        ORDER BY e.idElemento ASC`
    const res = await dbCtrl.execute(query)
    return res.rows
}

async function statistics(id){
    //we want to have a number related to the dayweek in the following order:
    //Monday = 1, Tuesday = 2 and so on until Sunday=7
    const currentdate = new Date();
    let weekday = currentdate.getDay()
    if (weekday == 0){
        weekday = 7
    }
    const since = (weekday - 1);
    //Notice that in order to specify a concrete type "::type" it is necessary to add it after the variable/value 
    //type has to be a valid postegress datatype.Exemple: integer,text,date, etc.
    // const query = {
    //     text: "SELECT (fecha - CURRENT_DATE) + $3::integer  as dia , dstrecorrida  FROM estadisticas WHERE idUsuario=$1 and fecha >= (CURRENT_DATE - $2::integer) ORDER BY dia asc",
    //     values:[id,since,weekday],
    // }
   const query = SQL `SELECT (fecha - CURRENT_DATE) + ${weekday}::integer as dia ,dstrecorrida 
                      FROM estadisticas WHERE idUsuario=${id} and fecha >= (CURRENT_DATE - ${since}::integer)
                        ORDER BY dia asc`
    console.log(query);
    
    let querystatisticslist = (await dbCtrl.execute(query)).rows;
    console.log("The result of querystatis")
    console.log(querystatisticslist)
    //It is undefined if the user hasn't had a statistic yet. 
    if (querystatisticslist.length == 0) {
        console.log("es indefinido")
        const newStatistic ={
            dia: 1,
            dstrecorrida: "0",    
        }
        querystatisticslist.splice(0,0,newStatistic); 
    }
    let i = 0;
    console.log(querystatisticslist)

    while(querystatisticslist.length < weekday){
        console.log("el dia es:")
        console.log(i + 1);
            
        if(i == querystatisticslist.length || querystatisticslist[i].dia != i+1){
            const newStatistic ={
                dia: i+1,
                dstrecorrida: "0",    
            } 
            querystatisticslist.splice(i,0,newStatistic); 
        }
        i++;
        console.log("a por el siguiente")
    }
    console.log(querystatisticslist);
    return querystatisticslist;
}


async function resetPassword ({email, password}) {
    const query = {
        text: "SELECT id \
                FROM usuarios \
                WHERE email = $1",
        values: [email],
    };
    const res = await dbCtrl.execute(query);
    if (res.rows.length === 1) {
        const query = {
            text: "UPDATE usuarios SET password = $2 WHERE email = $1",
            values: [email, password]
        }
        await dbCtrl.execute(query);
        return {
            result: true,
        }
    } else {
        return {
            result: false,
        }
    }
}

async function getInfo(id) {
    const query = SQL`SELECT nombre, email, tipoUsuario, tipoPerfil, genero, descripcion, fechaDeNacimiento,
            fechaDeRegistro, pais, rutaImagen, nSeguidores, nSeguidos, nPost
        FROM usuarios
        WHERE id = ${id}`;
    return (await dbCtrl.execute(query)).rows[0]
}

async function putInfo(id, info) {
    const query = SQL`UPDATE usuarios SET nombre=${info.nombre}, genero=${info.genero},
            descripcion=${info.descripcion}, fechadenacimiento=${info.fechadenacimiento}, pais=${info.pais}
        WHERE id=${id}`
    await dbCtrl.execute(query);
}

async function putSettings(id, set) {
    const query = SQL`UPDATE usuarios SET sEdad = ${set.sEdad}, sDistancia =${set.sDistancia},
            sInvitacion = ${set.sInvitacion}, sSeguidor = ${set.sSeguidor}, nMensaje = ${set.nMensaje}
        WHERE id = ${id}`
    await dbCtrl.execute(query)
}

async function getSettings(id) {
    const query = SQL`SELECT sEdad, sDistancia, sInvitacion, sSeguidor, nMensaje
        FROM usuarios
        WHERE id = ${id}`
    const res = await dbCtrl.execute(query);
    return res.rows[0];
}

async function getGlobaldst(id){
    const query = SQL`SELECT dstrecorrida
        FROM usuarios
        WHERE id =${id}`
    const res = await dbCtrl.execute(query);
    return res.rows[0];
}

async function fbLogin(user) {
    const oldUser = await getByEmail(user.email);
    if (oldUser === undefined) {
        return (create(user));
    } else {
        return {
            created: false,
            id: oldUser.id
        };
    }
}

async function getProfileImg(id) {
    const imgDirPath = path.join(userResourcePath, `${id}`, 'profile')
    let img
    try {
        const files = await fs.readdir(imgDirPath)
        const imgPath = path.resolve(imgDirPath, files[0])
        img = await fs.readFile(imgPath, { encoding: constants.encoding })
    } catch (err) {
        const userExists = await exists(id)
        if (!userExists) {
            throw Error('User does not exist')
        } else {
            throw Error('User does not have profile image')
        }
    }
    return img
}

async function setProfileImg(id, img, ext) {
    const userExists = await exists(id)
    if (!userExists) {
        throw Error('User does not exist')
    }
    const imgDirPath = path.join(userResourcePath, `${id}`, 'profile')
    await fs.rmdir(imgDirPath, {recursive: true})
    await fs.mkdir(imgDirPath, {recursive: true})
    const imgPath = path.join(imgDirPath, `profile.${ext}`)
    const imgString = img.toString()
    await fs.writeFile(imgPath, imgString, {encoding: constants.encoding});
}

async function follow(body) {

    let query = SQL`SELECT *
                    FROM bloqueados
                    WHERE (idBloqueado = ${body.idFollower} AND idBloqueador = ${body.idFollowed}) OR
                            (idBloqueador = ${body.idFollower} AND idBloqueado = ${body.idFollowed})`;
    const res = await dbCtrl.execute(query);
    let iB = true;

    if (res.rows.length === 0) {
        iB = false;
        query = SQL`INSERT INTO seguidores(idSeguidor, idSeguido)
            values(${body.idFollower}, ${body.idFollowed})`;
        await dbCtrl.execute(query);

        query = SQL`UPDATE usuarios SET nSeguidores = nSeguidores + 1
            WHERE id = ${body.idFollowed}`;
        await dbCtrl.execute(query);

        query = SQL`UPDATE usuarios SET nSeguidos = nSeguidos + 1
            WHERE id = ${body.idFollower}`;
        await dbCtrl.execute(query);
    }
    return {
        isBlocked: iB
    };
}

async function unfollow(idFollower, idFollowed) {
    let query = SQL`DELETE FROM seguidores WHERE idSeguidor = ${idFollower} AND idSeguido = ${idFollowed}`;
    await dbCtrl.execute(query);

    query = SQL`UPDATE usuarios SET nSeguidores = nSeguidores - 1
            WHERE id = ${idFollowed}`;
    await dbCtrl.execute(query);

    query = SQL`UPDATE usuarios SET nSeguidos = nSeguidos - 1
            WHERE id = ${idFollower}`;
    await dbCtrl.execute(query);
}

async function followers(idFollowed) {
    const query = SQL`SELECT u.id, u.nombre
                    FROM usuarios u, seguidores s
                    WHERE s.idSeguido = ${idFollowed} AND u.id = s.idSeguidor`;
    const res = await dbCtrl.execute(query);
    return res.rows;
}

async function followed(idFollower) {
    const query = SQL`SELECT u.id, u.nombre
                    FROM usuarios u, seguidores s
                    WHERE s.idSeguidor = ${idFollower} AND u.id = s.idSeguido`;
    const res = await dbCtrl.execute(query);
    return res.rows;
}

async function shortUsersInfo(currentID) {
    let query = SQL `SELECT u.id, u.nombre
                    FROM usuarios u
                    WHERE id <> ${currentID} AND id NOT IN (SELECT idBloqueador
                                                            FROM bloqueados
                                                            WHERE idBloqueado = ${currentID})
                    ORDER BY u.dstrecorrida DESC`;
    const res = await dbCtrl.execute(query);
    for (let i=0; i<res.rows.length; ++i) {
        let blocked = true;
        query = SQL `SELECT *
                    FROM bloqueados
                    WHERE idBloqueador = ${currentID} AND idBloqueado = ${res.rows[i].id}`;
        const res2 = await dbCtrl.execute(query);
        if (res2.rows.length === 0) {
            blocked = false;
        }
        res.rows[i].bloqueado = blocked;
    }
    return res.rows;
}

async function block(body) {
    let query = SQL`INSERT INTO bloqueados(idBloqueador, idBloqueado)
            values(${body.idBlocker}, ${body.idBlocked})`;
    await dbCtrl.execute(query);

    query = SQL`SELECT *
                    FROM seguidores
                    WHERE (idSeguidor = ${body.idBlocker} AND idSeguido = ${body.idBlocked})`;
    let res = await dbCtrl.execute(query);
    let brFBd = false;


    if (res.rows.length === 1) {
        unfollow(body.idBlocker, body.idBlocked);
        brFBd = true;
    }


    query = SQL`SELECT *
                    FROM seguidores
                    WHERE (idSeguidor = ${body.idBlocked} AND idSeguido = ${body.idBlocker})`;
    res = await dbCtrl.execute(query);
    let bdFBr = false;

    if (res.rows.length === 1) {
        unfollow(body.idBlocked, body.idBlocker);
        bdFBr = true;
    }

    return {
        blockerFollowedBlocked: brFBd,
        blockedFollowedBlocker: bdFBr
    };
}

async function unblock(idBlocker, idBlocked) {
    const query = SQL`DELETE FROM bloqueados WHERE idBloqueador = ${idBlocker} AND idBloqueado = ${idBlocked}`;
    await dbCtrl.execute(query);
}

async function userInfo(id, id2) {
    let query = SQL `SELECT u.id, u.nombre, u.descripcion, u.fechaDeNacimiento, u.pais, u.nSeguidores,
                        u.nSeguidos, u.sEdad, u.sSeguidor, u.nMensaje
                        FROM usuarios u
                        WHERE id = ${id}`;
    const res = await dbCtrl.execute(query);

    query = SQL `SELECT *
                       FROM seguidores
                       WHERE idSeguidor = ${id2} AND idSeguido = ${id}`
    const seg = await dbCtrl.execute(query);
    let sigue = false;
    if (seg.rows.length === 1) {sigue = true;}
    res.rows.forEach(function (element) {
        element.seguir = sigue;
      });

    query = SQL `SELECT *
                       FROM bloqueados
                       WHERE idBloqueador = ${id2} AND idBloqueado = ${id}`
    const blo = await dbCtrl.execute(query);
    let bloqueado = false;
    if (blo.rows.length === 1) {bloqueado = true;}
    res.rows.forEach(function (element) {
        element.bloqueado = bloqueado;
    });

    return res.rows[0];
}

async function like(body) {
    if (body.type === 'element') {
        let query = SQL`INSERT INTO likesElementos(idUsuario, idElemento)
            values(${body.idUser}, ${body.idElement})`;
        await dbCtrl.execute(query);

        query = SQL`UPDATE elementos SET nLikes = nLikes + 1
            WHERE idElemento = ${body.idElement}`;
        await dbCtrl.execute(query);
    }
    else if (body.type === 'comment') {
        let query = SQL`INSERT INTO likesComentarios(idUsuario, idElemento)
            values(${body.idUser}, ${body.idElement})`;
        await dbCtrl.execute(query);
        
        query = SQL`UPDATE comentarios SET nLikes = nLikes + 1
                    WHERE idComentario = ${body.idElement}`;
        await dbCtrl.execute(query);
    }
}

async function unlike(idUser, idElement, type) {
    if (type === 'element') {
        let query = SQL`DELETE FROM likesElementos WHERE idUsuario = ${idUser} AND idElemento = ${idElement}`;
        await dbCtrl.execute(query); 

        query = SQL`UPDATE elementos SET nLikes = nLikes - 1
            WHERE idElemento = ${idElement}`;
        await dbCtrl.execute(query);
    }
    else if (type === 'comment') {
        let query = SQL`DELETE FROM likesComentarios WHERE idUsuario = ${idUser} AND idElemento = ${idElement}`;
        await dbCtrl.execute(query);

        query = SQL`UPDATE comentarios SET nLikes = nLikes - 1
            WHERE idComentario = ${idElement}`;
        await dbCtrl.execute(query);
    }
}

async function importE(body) {
    if (body.type === "training") {
        await training.importE(body);
    }
    else if (body.type === "diet") {
        await diet.importE(body);
    }
    else if (body.type === "route") {
        await route.importE(body);
    }
}

async function getEvents(id) {
    const query = SQL`
        SELECT *
        FROM eventos
        WHERE idcreador=${id}
        ORDER BY fecha DESC, hora DESC`
    const res = await dbCtrl.execute(query)
    return res.rows
}


module.exports = {
    create,
    validate,
    fbLogin,
    getById,
    getByEmail,
    getInfo,
    getSettings,
    getProfileImg,
    getGlobaldst,
    putInfo,
    putSettings,
    setProfileImg,
    resetPassword,
    del,
    routes,
    trainings,
    diets,
    statistics,
    follow,
    unfollow,
    followers,
    followed,
    shortUsersInfo,
    block,
    unblock,
    userInfo,
    like,
    unlike,
    importE,
    getEvents
}
