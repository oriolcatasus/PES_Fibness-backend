const path = require('path')
const fs = require('fs').promises

const SQL = require('sql-template-strings')

const dbCtrl = require("../ctrls/dbCtrl")
const {resourcePath} = require('../constants')

const userResourcePath = path.join(resourcePath, 'user')


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

async function del(id) {
    const query = SQL`DELETE FROM usuarios WHERE id = ${id}`
    const userPath = path.join(userResourcePath, `${id}`)
    const promises = [
        dbCtrl.execute(query),
        fs.rmdir(userPath, {recursive: true})
    ]
    await Promise.all(promises)
}


async function trainings(id) {
    const query = SQL`SELECT e.idElemento, e.nombre, e.descripcion
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
    const query = SQL`SELECT e.idElemento, e.nombre, e.descripcion
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
<<<<<<< HEAD
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
=======
    const query = SQL`UPDATE usuarios SET password = ${password} WHERE email = ${email}`
    await dbCtrl.execute(query);
>>>>>>> f7ebedfe4270b5d6942424256f4fba48ecd3ae6e
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
    const files = await fs.readdir(imgDirPath)
    return path.resolve(imgDirPath, files[0])
}

async function setProfileImg(id, img, ext) {
    const user = await getById(id)
    if (user === undefined) {
        throw Error('User does not exist')
    }
    const imgDirPath = path.join(userResourcePath, `${id}`, 'profile')
    await fs.rmdir(imgDirPath, {recursive: true})
    await fs.mkdir(imgDirPath, {recursive: true})
    const imgPath = path.join(imgDirPath, `profile.${ext}`)
    await fs.writeFile(imgPath, img);
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
    trainings,
    diets,
}
