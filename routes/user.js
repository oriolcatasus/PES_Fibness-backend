const express = require("express");

const user = require("../src/models/userModel");

const router = express.Router();


router.post('/', async function(req, res, next) {
    console.log(req.body);
    try {
        await user.create(req.body);
        res.sendStatus(201);
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

module.exports = router;