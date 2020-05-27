const path = require('path')
const fs = require('fs').promises

const SQL = require('sql-template-strings')

const dbCtrl = require("../ctrls/dbCtrl")
const constants = require('../constants')

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
    let query = SQL`INSERT INTO seguidores(idSeguidor, idSeguido)
            values(${body.idFollower}, ${body.idFollowed})`;
    await dbCtrl.execute(query);

    query = SQL`UPDATE usuarios SET nSeguidores = nSeguidores + 1
            WHERE id = ${body.idFollowed}`;
    await dbCtrl.execute(query);

    query = SQL`UPDATE usuarios SET nSeguidos = nSeguidos + 1
            WHERE id = ${body.idFollower}`;
    await dbCtrl.execute(query);
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
    const query = SQL `SELECT u.id, u.nombre
                    FROM usuarios u
                    WHERE id <> ${currentID} AND id NOT IN (SELECT idBloqueado
                                                            FROM bloqueados
                                                            WHERE idBloqueador = ${currentID})`;
    const res = await dbCtrl.execute(query);
    return res.rows;
}

async function block(body) {
    let query = SQL`INSERT INTO bloqueados(idBloqueador, idBloqueado)
            values(${body.idBlocker}, ${body.idBlocked})`;
    await dbCtrl.execute(query);
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
    if (seg.rows.length == 1) sigue = true;
    res.rows.forEach(function (element) {
        element.seguir = sigue;
      });
    return res.rows[0];
}

async function like(body) {
    if (body.type == 'element') {
        let query = SQL`INSERT INTO likesElementos(idUsuario, idElemento)
            values(${body.idUser}, ${body.idElement})`;
        await dbCtrl.execute(query);

    
        query = SQL`UPDATE elementos SET nLikes = nLikes + 1
            WHERE idElemento = ${body.idElement}`;
        await dbCtrl.execute(query);   
    }
    else if (body.type == 'comment') {
        let query = SQL`INSERT INTO likesComentarios(idUsuario, idElemento)
            values(${body.idUser}, ${body.idElement})`;
        await dbCtrl.execute(query);
    
        query = SQL`UPDATE comentarios SET nLikes = nLikes + 1
            WHERE idComentario = ${body.idElement}`;
        await dbCtrl.execute(query);   
    }
}

async function unlike(idUser, idElement, type) {
    if (type == 'element') {
        let query = SQL`DELETE FROM likesElementos WHERE idUsuario = ${idUser} AND idElemento = ${idElement}`;
        await dbCtrl.execute(query);
    
        query = SQL`UPDATE elementos SET nLikes = nLikes - 1
            WHERE idElemento = ${idElement}`;
        await dbCtrl.execute(query);  
    }
    else if (type == 'comment') {
        let query = SQL`DELETE FROM likesComentarios WHERE idUsuario = ${idUser} AND idElemento = ${idElement}`;
        await dbCtrl.execute(query);
    
        query = SQL`UPDATE comentarios SET nLikes = nLikes - 1
            WHERE idComentario = ${idElement}`;
        await dbCtrl.execute(query);  
    }
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
    putInfo,
    putSettings,
    setProfileImg,
    resetPassword,
    del,
    routes,
    trainings,
    diets,
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
}
