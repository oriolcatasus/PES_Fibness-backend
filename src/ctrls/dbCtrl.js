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

async function delAll() {
    const queryTables = {
        text: "SELECT table_name \
            FROM information_schema.tables \
            WHERE table_schema=$1 and table_name<>$2",
        values: ["public", "undefined"]
    }
    const tables = (await execute(queryTables)).rows;
    let queryTruncate = "";
    tables.forEach(({table_name}) => {
        queryTruncate += "DELETE FROM " + table_name + " CASCADE;";
    });
    await execute(queryTruncate);
}

module.exports = {
    migrate,
    connect,
    execute,
    delAll,
    disconnect
}