const express = require("express");

//db
const dbCtrl = require("./ctrls/dbCtrl");
const { maxReqSize } = require('./constants')

//Routes
const user = require("./routes/user");
const training = require("./routes/training")
const diet = require("./routes/diet")
const meal = require("./routes/meal")
const aliment = require("./routes/aliment")
const exercise = require("./routes/exercise")
const route = require("./routes/route")
const comment = require("./routes/comment")
const event = require('./routes/event')
const statistic = require('./routes/statistic')

//Middleware
const errorHandler = require("./middleware/errorHandlers");

const port = process.env.PORT || 3000;

const app = express();
let server;

app.use(express.raw({
    limit: maxReqSize,
    type: 'image/*'
}))

app.use(express.json());

app.use("/user", user);
app.use("/training", training);
app.use("/exercise",exercise);
app.use("/diet", diet);
app.use("/meal", meal);
app.use("/aliment", aliment);
app.use("/route", route);
app.use("/comment", comment);
app.use('/event', event)
app.use("/statistic", statistic)

app.get("/test", (req, res) => {
    console.log("Hello");
    res.sendStatus(200);
});

//Error Handlers
app.use(errorHandler.validation);
app.use(errorHandler.def);


async function start() {
    await dbCtrl.connect();
    server = app.listen(port, () => {
        console.log("Server started at port " + port);
    });
}

async function stop() {
    await server.close();
    dbCtrl.disconnect();
}

module.exports = {
    start,
    stop,
    app
}
