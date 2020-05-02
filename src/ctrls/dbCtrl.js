const { Pool } = require('pg');
const pgMigrate = require("node-pg-migrate").default;

const defaultDatabaseUrl = 'postgres://fibness:fibness@localhost:5432/fibness'
let pool;

function connect() {
    pool = new Pool({
        connectionString: getDatabaseUrl()
    });
}

async function migrate() {
    await pgMigrate({
        databaseUrl: getDatabaseUrl(),
        direction: "up",
        dir: "./migrations",
    });
}

function getDatabaseUrl() {
    return process.env.DATABASE_URL || defaultDatabaseUrl;
}

async function execute(query) {
    return pool.query(query);
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

async function seed() {

}

module.exports = {
    migrate,
    connect,
    execute,
    delAll,
    seed,
    disconnect
}
