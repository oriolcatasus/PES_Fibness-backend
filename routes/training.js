const express = require("express");

const training = require("../src/models/trainingModel");

const router = express.Router();

router.delete('/:idElemento', async (req, res) => {
    console.log(req.body);
    try {
        await training.del(req.params.idElemento);
        res.sendStatus(200);
    } catch (e) {
        console.error(e.message);
        res.status(400).send(e.message);
    }
});

router.post('/', async (req, res) => {
    console.log(req.params.id);
    console.log(req.body);
    try {
        await training.create(req.body, req.params.id);
        res.sendStatus(200);
    } catch (e) {
        console.error(e.message);
        res.status(400).send(e.message);
    }
});


module.exports = router;