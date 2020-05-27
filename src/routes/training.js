const express = require("express");

const training = require("../models/trainingModel");

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
        const result = await training.create(req.body);
        res.status(201).send(result);
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
        res.status(400).send(e.message);
    }
});

//Get the activities of a training
router.get('/:idElemento/activities', async function(req, res) {
    try {
        const trainingSet = await training.activities(req.params.idElemento);
        res.status(200).send(trainingSet);
    } catch (e) {
        console.error(e.message);
        res.status(400).send(e.message);
    }
})



module.exports = router;
