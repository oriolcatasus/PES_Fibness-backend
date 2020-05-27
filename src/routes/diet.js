const express = require("express");

const diet = require("../models/dietModel");

const router = express.Router();


//create
router.post('/', async (req, res) => {
    try {
        const result = await diet.create(req.body);
        res.status(201).send(result);
    } catch (e) {
        console.error(e.message);
        res.status(400).send(e.message);
    }
});

//delete
router.delete('/:idElemento', async (req, res) => {
    try {
        await diet.del(req.params.idElemento);
        res.sendStatus(200);
    } catch (e) {
        console.error(e.message);
        res.status(400).send(e.message);
    }
});

//update element (aka name and/or description)
router.put('/:idElemento', async (req, res) => {
    try {
        await diet.update(req.body, req.params.idElemento);
        res.sendStatus(200);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

router.get('/:idElemento/:dia', async function(req, res, next) {
    try {
        const dayMealSet = await diet.dayMeals(req.params.idElemento, req.params.dia);
        res.status(200).send(dayMealSet);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

router.get('/:idElemento/comments', async (req, res) => {
    console.log("hola");
    try {
        const comments = await diet.comments(req.params.idElemento);
        res.status(200).send(comments);
    } catch (e) {
        console.error(e.message);
        res.status(400).send(e.message);
    }
});



module.exports = router;
