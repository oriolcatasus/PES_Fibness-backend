const { Pool } = require('pg');

const database = (function() {
    let env = process.env.PGDATABASE;
    if (env === undefined) {
        return "fibness";
    }
    return env
})();
//console.log(database);

const pool = new Pool({
    user: "fibness",
    host: "10.4.41.146",
    database,
    password: "pes08",
    port: 5432
});

async function select(query) {
    return await pool.query(query);
}

async function insert(query) {
    return await pool.query(query);
}

async function del(query) {
    return await pool.query(query);
}


module.exports = {
    select,
    insert,
    del
}