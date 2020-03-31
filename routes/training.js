const express = require("express");

const training = require("../src/models/trainingModel");

const router = express.Router();

//delete
router.delete('/:idElemento', async (req, res) => {
    //console.log(req.body);
    try {
        await training.del(req.params.idElemento);
        res.sendStatus(200);
    } catch (e) {
        //console.error(e.message);
        res.status(400).send(e.message);
    }
});

router.post('/', async (req, res) => {
    try {
        await training.create(req.body, req.params.id);
        res.sendStatus(200);
    } catch (e) {
        //console.error(e.message);
        res.status(400).send(e.message);
    }
});

//create
router.post('/', async (req, res) => {
    //console.log(req.body);
    try {
        await training.create(req.params.nombre);
        res.sendStatus(200);
    } catch (e) {
        //console.error(e.message);
        res.status(400).send(e.message) ;
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



module.exports = router;