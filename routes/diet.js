const express = require("express");

const diet = require("../src/models/dietModel");

const router = express.Router();


//create
router.post('/', async (req, res) => {
    try {
        await diet.create(req.body);
        res.sendStatus(200);
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
        //console.error(e.message);
        res.status(400).send(e.message);
    }
});

router.get('/:idElemento/:dia', async function(req, res, next) {
    try {
        const dayMealSet = await diet.dayMeals(req.params.idElemento, req.params.dia);
        res.send(dayMealSet);
    } catch (err) {
        next(err);
    }
})



module.exports = router;