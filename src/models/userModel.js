const SQL = require('sql-template-strings');

const dbCtrl = require("../ctrls/dbCtrl");

async function create(user) {
    let result; 
    try {
        let query = {
            text: "INSERT INTO usuarios(nombre, password, email) values($1, $2, $3)",
            values: [user.nombre, user.password, user.email]
        };
        await dbCtrl.execute(query); 
        query = {
            text: "SELECT id \
                FROM usuarios \
                WHERE email = $1",
            values: [user.email]
        }
        const { id } = (await dbCtrl.execute(query)).rows[0];
        result = {
            created: true,
            id
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
    const query = {
        text: "SELECT * \
            FROM usuarios \
            WHERE email = $1",
        values: [email]
    }
    return (await dbCtrl.execute(query)).rows[0];
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
    let query = {
        text: "DELETE FROM usuarios where id = $1",
        values: [id]
    }
    await dbCtrl.execute(query);
}


async function trainings(id) {
    let query = {
        text: "SELECT e.idElemento, e.nombre, e.descripcion \
               FROM elementos e\
               WHERE e.idUsuario = $1 AND EXISTS \
                                        (SELECT * \
                                         FROM entrenamientos \
                                         WHERE idUsuario = $1) \
               ORDER BY e.idElemento ASC",
        values: [id]
    }
    res = (await dbCtrl.execute(query));
    let trainingSet = [];
    for (i=0; i<res.rows.length; ++i) {
        trainingSet.push(res.rows[i]);
    }
    return trainingSet;
}

async function diets(id) {
    let query = {
        text: "SELECT e.idElemento, e.nombre, e.descripcion \
               FROM elementos e\
               WHERE e.idUsuario = $1 AND EXISTS \
                                        (SELECT * \
                                         FROM dietas \
                                         WHERE idUsuario = $1) \
               ORDER BY e.idElemento ASC",
        values: [id]
    }
    res = (await dbCtrl.execute(query));
    let dietSet = [];
    for (i=0; i<res.rows.length; ++i) {
        dietSet.push(res.rows[i]);
    }
    return dietSet;
}

async function resetPassword ({email, password}) {
    let query = {
        text: "UPDATE usuarios SET password = $2 WHERE email = $1",
        values: [email, password]
    }
    await dbCtrl.execute(query);
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
    let query = {
        text: "UPDATE usuarios SET sEdad = $2, sDistancia =$3, sInvitacion = $4, \
                sSeguidor = $5, nMensaje = $6 \
                WHERE id = $1",
        values: [id, set.sEdad, set.sDistancia, set.sInvitacion, set.sSeguidor, set.nMensaje]
    }
    await dbCtrl.execute(query)
}

async function getSettings(id) {
    let query = {
        text: "SELECT sEdad, sDistancia, sInvitacion, sSeguidor, nMensaje \
                FROM usuarios \
                WHERE id = $1",
        values: [id]
    }
    res = (await dbCtrl.execute(query)).rows[0];
    return res;
}

async function fbLogin(user) {
    const oldUser = await getByEmail(user.email);
    if (oldUser === undefined) {
        return (await create(user));
    } else {
        return {
            created: false,
            id: oldUser.id
        };
    }
}


module.exports = {
    create,
    validate,
    del,
    trainings,
    diets,
    resetPassword,
    getInfo,
    putInfo,
    getSettings,
    putSettings,
    getByEmail,
    fbLogin
}