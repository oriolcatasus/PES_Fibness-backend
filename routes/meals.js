const express = require("express");

const meal = require("../src/models/mealModel");

const router = express.Router();


//create
router.post('/', async (req, res) => {
    try {
        await meal.create(req.body);
        res.sendStatus(200);
    } catch (e) {
        console.error(e.message);
        res.status(400).send(e.message);
    }
});

//delete
router.delete('/:idComida', async (req, res) => {
    try {
        await meal.del(req.params.idElemento);
        res.sendStatus(200);
    } catch (e) {
        console.error(e.message);
        res.status(400).send(e.message);
    }
});

//update element (aka name and/or description)
router.put('/:idComida', async (req, res) => {
    try {
        await meal.update(req.body, req.params.idElemento);
        res.sendStatus(200);
    } catch (e) {
        //console.error(e.message);
        res.status(400).send(e.message);
    }
});



module.exports = router;