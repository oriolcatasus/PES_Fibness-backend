const express = require("express");

const exercise = require("../models/exerciseModel");

const router = express.Router();

//create
router.post('/', async (req, res) => {
    try {
        await exercise.create(req.body);
        res.sendStatus(200);
    } catch (e) {
        console.error(e.message);
        res.status(400).send(e.message);
    }
});


//update element (aka name and/or description)
router.put('/:idActividad', async (req, res) => {
    try {
        await exercise.update(req.body, req.params.idActividad);
        res.sendStatus(200);
    } catch (e) {
        //console.error(e.message);
        res.status(400).send(e.message);
    }
});

//delete
router.delete('/:idActividad', async (req, res) => {
    try {
        await exercise.del(req.params.idActividad);
        res.sendStatus(200);
    } catch (e) {
        console.error(e.message);
        res.status(400).send(e.message);
    }
});




module.exports = router;