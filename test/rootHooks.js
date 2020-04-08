process.env.NODE_ENV = "test";

const { db } = require("config");

const dbCtrl = require("../src/ctrls/dbCtrl");

before(async function() {
    await dbCtrl.migrate(db)
    dbCtrl.connect(db);
});

after(async function() {
    dbCtrl.disconnect();
});