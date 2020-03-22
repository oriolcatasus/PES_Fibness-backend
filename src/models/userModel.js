const dbCtrl = require("../ctrls/dbCtrl");

async function create(user) {
    let query = {
        text: "INSERT INTO usuarios(nombre, password, email) values($1, $2, $3)",
        values: [user.nombre, user.password, user.email]
    }
    await dbCtrl.execute(query);
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
    del
}