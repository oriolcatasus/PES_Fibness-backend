const express = require("express");

const user = require("../models/userModel");

const router = express.Router();


router.post('/', async function(req, res, next) {
    console.log(req.body);
    try {
        const result = await user.create(req.body);
        if (result.created) {
            res.status(201);
        } else {
            res.status(400);
        }
        res.send(result);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', async (req, res) => {
    console.log(req.params.id);
    try {
        await user.del(req.params.id);
        res.sendStatus(200);
    } catch (e) {
        console.error(e.message);
        res.status(400).send(e.message);
    }
});

router.post('/validate', async function(req, res, next) {
    console.log(req.body);
    try {
        const valid = await user.validate(req.body);
        res.send(valid);
    } catch (err) {
        next(err);
    }
});

router.get('/:id/trainings', async function(req, res, next) {
    try {
        const trainingSet = await user.trainings(req.params.id);
        res.send(trainingSet);
    } catch (err) {
        next(err);
    }
})

router.get('/:id/diets', async function(req, res, next) {
    try {
        const dietSet = await user.diets(req.params.id);
        res.send(dietSet);
    } catch (err) {
        next(err);
    }
})

module.exports = router;