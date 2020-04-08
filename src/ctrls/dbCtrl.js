const { Pool } = require('pg');

let pool;

function connect(config) {
   pool = new Pool(config);
}

async function execute(query) {
    return await pool.query(query);
}

async function disconnect() {
    await pool.end();
}

module.exports = {
    connect,
    execute,
    disconnect
}