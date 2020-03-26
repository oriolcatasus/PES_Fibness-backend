const dbCtrl = require("../ctrls/dbCtrl");

async function create(user) {
    let query = {
        text: "INSERT INTO usuarios(nombre, password, email) values($1, $2, $3)",
        values: [user.nombre, user.password, user.email]
    };
    await dbCtrl.execute(query);
}

async function validate({email, password}) {
    let query = {
        text: "SELECT * \
                FROM usuarios \
                WHERE email = $1 AND password = $2",
        values: [email, password],
    };
    let res = await dbCtrl.execute(query);
    return (res.rows.length == 1);
}

async function del(id) {
    let query = {
        text: "DELETE FROM usuarios where id = $1",
        values: [id]
    }
    await dbCtrl.execute(query);
}


module.exports = {
    create,
    validate,
    del    
}