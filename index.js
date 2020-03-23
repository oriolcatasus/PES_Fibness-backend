const express = require("express");

//Routes
const user = require("./routes/user");
const training = require("./routes/training")

const app = express()
const port = 3000

app.use(express.json());

app.use("/user", user);

app.use("/user/:id/training", training);

app.get("/test", (req, res) => {
    console.log("Hello");
    res.sendStatus(200);
});

app.listen(port, () => 
{
    console.log("Server started at port "+ port);
});