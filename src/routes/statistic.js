const express = require("express");

const statistics = require("../models/statisticModel");

const router = express.Router();


//create
router.post('/', async (req, res) => {
    try {
        console.log("Hey estoy dentro de post")
        const result = await statistics.create(req.body);
        if(result == 200)
            res.status(200).send();
        else if(result == 201)
            res.status(201).send();
    } catch (e) {
        console.error(e.message);
        res.status(400).send(e.message);
    }
});

module.exports = router;
