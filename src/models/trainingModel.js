const dbCtrl = require("../ctrls/dbCtrl");

async function del(nombre) {
    let query = {
        text: "DELETE FROM elementos WHERE nombre = $1",
        values: [nombre]
    }
    await dbCtrl.execute(query);
}

module.exports = {
    del
}