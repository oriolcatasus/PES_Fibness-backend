const express = require("express");

const routes = require("../models/routeModel");

const router = express.Router();


//create
router.post('/', async (req, res) => {
    try {
        const result = await routes.create(req.body);
        res.status(201).send(result);
    } catch (e) {
        console.error(e.message);
        res.status(400).send(e.message);
    }
});

//delete
router.delete('/:idElemento', async (req, res) => {
    try {
        await routes.del(req.params.idElemento);
        res.sendStatus(200);
    } catch (e) {
        console.error(e.message);
        res.status(400).send(e.message);
    }
});

//update element (aka name and/or description)
router.put('/:idElemento', async (req, res) => {
    console.log("Trying to update a route with id:");
    console.log(req.params.idElemento);
    try {
        await routes.update(req.body, req.params.idElemento);
        res.sendStatus(200);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

module.exports = router;
