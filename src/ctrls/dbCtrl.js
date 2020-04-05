const { Pool } = require('pg');
const pgMigrate = require("node-pg-migrate").default;

let pool;

async function connect(config, migrate=true) {
    if (migrate) {
        await pgMigrate({
            databaseUrl: config,
            direction: "up",
            dir: "./migrations",
        });
    }
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