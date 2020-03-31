const express = require("express");

//Routes
const user = require("./routes/user");
const training = require("./routes/training")

//Middleware
const errorHandler = require("./middleware/errorHandlers");

const port = 3000;

const app = express();

app.use(express.json());

app.use("/user", user);

app.use("/user/:id/training", training);

app.get("/test", (req, res) => {
    console.log("Hello");
    res.sendStatus(200);
});

//Error Handlers
app.use(errorHandler.validation);
app.use(errorHandler.default);


app.listen(port, function() {
    console.log("Server started at port " + port);
});