process.env.NODE_ENV = "test";
process.env.PORT = 3010;

const { db } = require("config");

const dbCtrl = require("../src/ctrls/dbCtrl");
const app = require(`../src/app`);

before(async function() {
    await dbCtrl.migrate(db)
    //dbCtrl.connect(db);
    await app.start();
    await dbCtrl.delAll();
});

afterEach(async function() {
    await dbCtrl.delAll();
});

after(async function() {
    //dbCtrl.disconnect();
    app.stop();
});