const express = require("express");

const user = require("../src/models/userModel");

const router = express.Router();


router.post('/', async function(req, res, next) {
    try {
        await user.create(req.body);
        res.sendStatus(201);
    } catch (err) {
        next(err);
    }
});

router.post('/validate', async function(req, res, next) {
    try {
        const valid = await user.validate(req.body);
        res.send(valid);
    } catch (err) {
        next(err);
    }
});

module.exports = router;