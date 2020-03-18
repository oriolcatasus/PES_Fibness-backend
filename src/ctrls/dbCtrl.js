const { Pool } = require('pg');

const pool = new Pool({
    user: "fibness",
    host: "10.4.41.146",
    database: "fibness",
    password: "pes08",
    port: 5432
});

const queries = {
    usuarios: {
        insert: "INSERT INTO usuarios VALUES($1, $2, $3, $4)"
    }
}

async function insert(table, values) {
    //values.unshift("DEFAULT");  //serial id
    let query = {
        text: queries[table].insert,
        values
    }
    let res = await pool.query(query);
    return res;
}

module.exports = {
    insert
}