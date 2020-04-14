process.env.NODE_ENV = "test";

const { db } = require("config");

const dbCtrl = require("../src/ctrls/dbCtrl");

before(async function() {
    await dbCtrl.migrate(db)
    dbCtrl.connect(db);
    await dbCtrl.delAll();
});

afterEach(async function() {
    await dbCtrl.delAll();
});

after(async function() {
    dbCtrl.disconnect();
});