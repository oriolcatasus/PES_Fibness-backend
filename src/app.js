const express = require("express");
const { db } = require("config")

//db
const dbCtrl = require("./ctrls/dbCtrl");

//Routes
const user = require("./routes/user");
const training = require("./routes/training")
const diet = require("./routes/diet")
const meal = require("./routes/meal")
const aliment = require("./routes/aliment")
const exercise = require("./routes/exercise")
//Middleware
const errorHandler = require("../middleware/errorHandlers");

const port = process.env.PORT || 3000;

const app = express();
let server;

app.use(express.json());

app.use("/user", user);

app.use("/training", training);

app.use("/exercise",exercise);

app.use("/diet", diet);

app.use("/meal", meal);

app.use("/aliment", aliment);

app.get("/test", (req, res) => {
    console.log("Hello");
    res.sendStatus(200);
});

//Error Handlers
app.use(errorHandler.validation);
app.use(errorHandler.def);


async function start() {
    await dbCtrl.connect(db);
    server = app.listen(port, () => {    
        console.log("Server started at port " + port);
    });
}

async function stop() {
    dbCtrl.disconnect();
    server.close();
}

module.exports = {
    start,
    stop,
    app
}

