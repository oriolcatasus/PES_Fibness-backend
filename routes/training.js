const express = require("express");

const training = require("../src/models/trainingModel");

const router = express.Router();


//create

router.post('/', async (req, res) => {
    //console.log(req.body);
    try {
        await training.create(req.params.nombre);
        res.sendStatus(200);
    } catch (e) {
        //console.error(e.message);
        res.status(400).send(e.message);
    }
});

//update training
router.put('/:idElemento', async (req, res) => {
    //console.log(req.body);
    try {
        await training.update(req.params.nombre);
        res.sendStatus(200);
    } catch (e) {
        //console.error(e.message);
        res.status(400).send(e.message);
    }
});

//delete
router.delete('/:idElemento', async (req, res) => {
    //console.log(req.body);
    try {
        await training.del(req.params.nombre);
        res.sendStatus(200);
    } catch (e) {
        //console.error(e.message);
        res.status(400).send(e.message);
    }
});

module.exports = router;