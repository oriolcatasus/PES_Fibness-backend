const express = require('express')

const event = require('../models/eventModel')

const router = express.Router()

router.get('/', async function(req, res, next) {
    try {
        const events = await event.getAll()
        res.status(200).send(events)
    } catch (err) {
        next(err)
    }
})

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

router.get('/:id/participants', async function(req, res, next) {
    try {
        const participants = await event.participants(req.params.id)
        res.status(200).send(participants)
    } catch (err) {
        next(err)
    }
})

router.post('/:id/join', async function(req, res, next) {
    try {
        await event.join(req.params.id, req.body)
        res.sendStatus(201)
    } catch (err) {
        next(err)
    }
})

router.delete('/:idEvent/join/:idUser', async function(req, res, next) {
    try {
        await event.disjoin(req.params.idEvent, req.params.idUser)
        res.sendStatus(200)
    } catch (err) {
        next(err)
    }
})


module.exports = router
