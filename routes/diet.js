const express = require("express");

const diet = require("../src/models/dietModel");

const router = express.Router();


//create
router.post('/', async (req, res) => {
    try {
        await diet.create(req.body);
        res.sendStatus(200);
    } catch (e) {
        console.error(e.message);
        res.status(400).send(e.message);
    }
});


module.exports = router;