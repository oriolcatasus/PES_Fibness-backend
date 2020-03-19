const { Pool } = require('pg');

const pool = new Pool({
    user: "fibness",
    host: "10.4.41.146",
    database: "fibness",
    password: "pes08",
    port: 5432
});

async function insert(query) {
    return await pool.query(query);
}


module.exports = {
    insert
}