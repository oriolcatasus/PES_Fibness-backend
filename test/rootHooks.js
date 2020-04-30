process.env.NODE_ENV = "test";
process.env.PORT = 3010;

if (process.env.DATABASE_URL === undefined) {
    process.env.DATABASE_URL = "postgresql://fibness:fibness@localhost:5432/test"
}

const dbCtrl = require("../src/ctrls/dbCtrl");
const app = require(`../src/app`);

before(async function() {
    await dbCtrl.migrate()
    await app.start();
    await dbCtrl.delAll();
    await dbCtrl.seed();
});

afterEach(async function() {
    await dbCtrl.delAll();
    await dbCtrl.seed();
});

after(async function() {
    app.stop();
});