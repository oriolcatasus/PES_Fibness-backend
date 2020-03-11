const express = require("express");

const app = express();

app.get("/test", (req, res) => {
    console.log("Hello");
    res.sendStatus(200);
});

app.listen(3000, () => {
    console.log("Server started at http://localhost:${port}");
});