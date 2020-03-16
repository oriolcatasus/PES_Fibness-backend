const { Client } = require('pg');

const client = new Client({
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

async function init() {
    client.connect();
}

async function insert(table, values) {
    let query = {
        text: queries[table].insert,
        values
    }
    let res = await client.query(query);
    return res;   
}

module.exports = {
    init,
    insert
}