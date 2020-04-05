const express = require("express");
const config = require("config")

//db
const dbCtrl = require("./src/ctrls/dbCtrl");

//Routes
const user = require("./routes/user");
const training = require("./routes/training")

//Middleware
const errorHandler = require("./middleware/errorHandlers");

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use("/user", user);

app.use("/training", training);

app.get("/test", (req, res) => {
    console.log("Hello");
    res.sendStatus(200);
});

//Error Handlers
app.use(errorHandler.validation);
app.use(errorHandler.def);


(async function start() {
    await dbCtrl.connect(config.db);
    app.listen(port, () => {    
        console.log("Server started at port " + port);
    });
})()