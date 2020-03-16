const express = require("express");

const dbCtrl = require("./dbCtrl.js");

const app = express()
const port = 3000

app.use(express.json());

app.get("/test", (req, res) => {
    console.log("Hello");
    res.sendStatus(200);
});

app.post("/users", async (req, res) => {
    console.log(req.body);
    try {
        await dbCtrl.insert("usuarios", req.body);
        res.sendStatus(200);
    } catch(e) {
        console.error(e.message);
        res.status(400).send(e.message);
    }    
});

app.listen(port, () => 
{
    //console.log(`Server started at port ${port}`);
    /*Template literals are enclosed by the backtick (` `)  (grave accent)
    The next console.log is the same like the first one.The main diference is that the first one uses 
    template literals (` `) (grave accent) instead of using (" ")(quaotation marks) */
    console.log("Server started at port "+port);
    dbCtrl.init();
});