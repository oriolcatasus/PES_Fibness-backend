const express = require("express");

const training = require("../src/models/trainingModel");

const router = express.Router();

router.delete('/:nombre', async (req, res) => {
    //console.log(req.body);
    try {
        await training.del(req.params.nombre);
        res.sendStatus(200);
    } catch (e) {
        //console.error(e.message);
        res.status(400).send(e.message);
    }
});


module.exports = router;