const { Pool } = require('pg');
const pgMigrate = require("node-pg-migrate").default;

let pool;

function connect(config) {
    pool = new Pool(config);
}

async function migrate(config) {
    await pgMigrate({
        databaseUrl: config,
        direction: "up",
        dir: "./migrations",
    });
}

async function execute(query) {
    return await pool.query(query);
}

async function disconnect() {
    await pool.end();
}

module.exports = {
    migrate,
    connect,
    execute,
    disconnect
}