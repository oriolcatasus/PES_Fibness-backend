const express = require('express')

const event = require('../models/eventModel')

const router = express.Router()


router.post('/', async function(req, res, next) {
    try {
        const result = await event.create(req.body)
        res.status(201).send(result)
    } catch (err) {
        next(err)
    }
})

router.get('/:id', async function(req, res, next) {
    try {
        const eventRetrieved = await event.get(req.params.id)
        res.status(200).send(eventRetrieved)
    } catch (err) {
        next(err)
    }
})

router.put('/:id', async function(req, res, next) {
    try {
        await event.edit(req.params.id, req.body);
        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
})

router.delete('/:id', async function(req, res, next) {
    try {
        await event.del(req.params.id)
        res.sendStatus(200)
    } catch (err) {
        next(err)
    }
})

router.post('/:id/join', async function(req, res, next) {
    try {
        await event.join(req.params.id, req.body)
        res.sendStatus(200)
    } catch (err) {
        next(err)
    }
})


module.exports = router;