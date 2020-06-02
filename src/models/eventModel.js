const SQL = require('sql-template-strings')

const dbCtrl = require('../ctrls/dbCtrl')

async function create(event) {
    const query = SQL`
        INSERT INTO eventos(titulo, descripcion, fecha, hora, localizacion, idcreador)
        values(${event.titulo}, ${event.descripcion}, ${event.fecha}, ${event.hora},
            ${event.localizacion}, ${event.idcreador})
        RETURNING id`
    const res = await dbCtrl.execute(query)
    const id = res.rows[0].id
    return { id }
}

async function get(id) {
    const query = SQL`
        SELECT *
        FROM eventos
        WHERE id=${id}`
    const res = await dbCtrl.execute(query)
    return res.rows[0]
}

async function del(id) {
    const query1 = SQL`
        DELETE FROM participacionevento
        WHERE idevento = ${id}`
    const query2 = SQL`
        DELETE FROM eventos
        WHERE id = ${id}`
    await dbCtrl.execute(query1)
    await dbCtrl.execute(query2)
}

async function edit(id, event) {
    const query = SQL`
        UPDATE eventos
        SET titulo=${event.titulo}, descripcion=${event.descripcion}, fecha=${event.fecha}, hora=${event.hora},
            localizacion=${event.localizacion}
        WHERE id=${id}`
    await dbCtrl.execute(query)
}


module.exports = {
    create,
    del,
    edit,
    get
}