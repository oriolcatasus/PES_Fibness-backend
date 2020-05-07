require('dotenv').config({ path: 'test/.env' })

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