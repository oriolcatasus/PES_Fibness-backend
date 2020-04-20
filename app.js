const express = require("express");
const config = require("config")

//db
const dbCtrl = require("./src/ctrls/dbCtrl");

//Routes
const user = require("./routes/user");
const training = require("./routes/training")
const diet = require("./routes/diet")
const meal = require("./routes/meal")
const aliment = require("./routes/aliment")

//Middleware
const errorHandler = require("./middleware/errorHandlers");

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use("/user", user);

app.use("/training", training);

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
    dbCtrl.connect(config.db);
    app.listen(port, () => {    
        console.log("Server started at port " + port);
    });
}

function stop() {
    dbCtrl.disconnect();
    app.close();
}

module.exports = {
    start,
    stop
}

