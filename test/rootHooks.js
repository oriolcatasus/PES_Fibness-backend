process.env.NODE_ENV = "test";
process.env.PORT = 3002;

const config = require("config");

const dbCtrl = require("../src/ctrls/dbCtrl");

before(async function() {
    await dbCtrl.connect(config.db);
});

after(async function() {
    dbCtrl.disconnect();
});