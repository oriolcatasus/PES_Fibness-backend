const express = require("express");

const aliment = require("../src/models/alimentModel");

const router = express.Router();


//create
router.post('/', async (req, res) => {
    try {
        await aliment.create(req.body);
        res.sendStatus(200);
    } catch (e) {
        console.error(e.message);
        res.status(400).send(e.message);
    }
});

//delete
router.delete('/:idElemento', async (req, res) => {
    try {
        await aliment.del(req.params.idElemento);
        res.sendStatus(200);
    } catch (e) {
        console.error(e.message);
        res.status(400).send(e.message);
    }
});

//update element (aka name and/or description)
router.put('/:idElemento', async (req, res) => {
    try {
        await aliment.update(req.body, req.params.idElemento);
        res.sendStatus(200);
    } catch (e) {
        //console.error(e.message);
        res.status(400).send(e.message);
    }
});


module.exports = router;