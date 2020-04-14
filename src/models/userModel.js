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

async function getUserByEmail(email) {
    const query = {
        text: "SELECT * \
            FROM usuarios \
            WHERE email = $1",
        values: [email]
    }
    return await dbCtrl.execute(query)
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
                                         WHERE idUsuario = $1)",
        values: [id]
    }
    return (await dbCtrl.execute(query));
}

async function diets(id) {
    let query = {
        text: "SELECT e.idElemento, e.nombre, e.descripcion \
               FROM elementos e\
               WHERE e.idUsuario = $1 AND EXISTS \
                                        (SELECT * \
                                         FROM dietas \
                                         WHERE idUsuario = $1)",
        values: [id]
    }
    return (await dbCtrl.execute(query));
}


module.exports = {
    create,
    validate,
    del,
    trainings,
    diets    
}