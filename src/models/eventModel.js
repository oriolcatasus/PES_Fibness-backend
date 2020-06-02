const SQL = require('sql-template-strings')

const dbCtrl = require('../ctrls/dbCtrl')

async function create(event) {
    let query = SQL`
        INSERT INTO eventos(titulo, descripcion, fecha, hora, localizacion, idcreador)
        values(${event.titulo}, ${event.descripcion}, ${event.fecha}, ${event.hora},
            ${event.localizacion}, ${event.idcreador})
        RETURNING id`
    const res = await dbCtrl.execute(query)
    const id = res.rows[0].id
    query = SQL`
        INSERT INTO participacionevento(idevento, idusuario)
        values (${id}, ${event.idcreador})`
    await dbCtrl.execute(query)
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
    let query = SQL`
        DELETE FROM participacionevento
        WHERE idevento = ${id}`
    await dbCtrl.execute(query)
    query = SQL`
        DELETE FROM eventos
        WHERE id = ${id}`
    await dbCtrl.execute(query)
}

async function edit(id, event) {
    const query = SQL`
        UPDATE eventos
        SET titulo=${event.titulo}, descripcion=${event.descripcion}, fecha=${event.fecha}, hora=${event.hora},
            localizacion=${event.localizacion}
        WHERE id=${id}`
    await dbCtrl.execute(query)
}

async function join(id, { idusuario }) {
    const query = SQL`
        INSERT INTO participacionevento(idevento, idusuario)
        values (${id}, ${idusuario})`
    await dbCtrl.execute(query)
}


module.exports = {
    create,
    del,
    edit,
    get,
    join
}