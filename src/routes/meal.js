const express = require("express");

const meal = require("../models/mealModel");

const router = express.Router();


//create
router.post('/', async (req, res) => {
    try {
        const result = await meal.create(req.body);
        res.status(201).send(result);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

//delete
router.delete('/:idComida', async (req, res) => {
    try {
        await meal.del(req.params.idComida);
        res.sendStatus(200);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

//update element (aka name and/or description)
router.put('/:idComida', async (req, res) => {
    try {
        await meal.update(req.body, req.params.idComida);
        res.sendStatus(200);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

router.get('/:idComida/aliments', async function(req, res, next) {
    try {
        const alimentsSet = await meal.aliments(req.params.idComida);
        res.status(200).send(alimentsSet);
    } catch (err) {
        res.status(400).send(err.message);
    }
})



module.exports = router;
