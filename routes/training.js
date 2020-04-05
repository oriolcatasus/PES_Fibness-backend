const express = require("express");

const training = require("../src/models/trainingModel");

const router = express.Router();

//delete
router.delete('/:idElemento', async (req, res) => {
    try {
        await training.del(req.params.idElemento);
        res.sendStatus(200);
    } catch (e) {
        console.error(e.message);
        res.status(400).send(e.message);
    }
});

//create
router.post('/', async (req, res) => {
    try {
        await training.create(req.body);
        res.sendStatus(200);
    } catch (e) {
        console.error(e.message);
        res.status(400).send(e.message);
    }
});


//update element (aka name and/or description)
router.put('/:idElemento', async (req, res) => {
    try {
        await training.update(req.body, req.params.idElemento);
        res.sendStatus(200);
    } catch (e) {
        //console.error(e.message);
        res.status(400).send(e.message);
    }
});



module.exports = router;