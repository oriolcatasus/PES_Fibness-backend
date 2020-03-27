const express = require("express");

const user = require("../src/models/userModel");

const router = express.Router();

router.post('/', async (req, res) => {
    //console.log(req.body);
    try {
        await user.create(req.body);
        res.sendStatus(200);
    } catch (e) {
        //console.error(e.message);
        res.status(400).send(e.message);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await user.del(req.params.id);
        res.sendStatus(200);
    } catch (e) {
        //console.error(e.message);
        res.status(400).send(e.message);
    }
});

module.exports = router;