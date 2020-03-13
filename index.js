const express = require("express");

const app = express()
const port = 3000

app.get("/test", (req, res) => {
    console.log("Hello");
    res.sendStatus(200);
});

app.listen(port, () => 
{
    console.log(`Server started at port ${port}`);
    /*Template literals are enclosed by the backtick (` `)  (grave accent)
    The next console.log is the same like the first one.The main diference is that the first one uses 
    template literals (` `) (grave accent) instead of using (" ")(quaotation marks) */
    //console.log("Server started at port "+port);
});