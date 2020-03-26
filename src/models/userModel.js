const dbCtrl = require("../ctrls/dbCtrl");

async function create(user) {
    if (user.facebook === undefined) {
        user.facebook = false;
    }
    const query = {
        text: "INSERT INTO usuarios(nombre, password, email, facebook) values($1, $2, $3, $4)",
        values: [
            user.nombre,
            user.password,
            user.email,
            user.facebook
        ]
    }
    await dbCtrl.execute(query);
}


module.exports = {
    create
}