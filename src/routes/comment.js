const express = require("express");

const comment = require("../models/commentModel");

const router = express.Router();

router.post('/', async function(req, res) {
    try {
        com = await comment.comment(req.body);
        res.status(201).send(com);
    } catch(err) {
        res.status(400).send(err.message);
    }
})

router.delete('/:idComment', async function(req, res) {
    try {
        await comment.delComment(req.params.idComment);
        res.sendStatus(200)
    } catch(err) {
        res.status(400).send(err.message);
    }
})


router.get('/:idElemento/comments', async function(req, res) {
    try {
        const c = await comment.comments(req.params.idElemento);
        res.status(200).send(c);
    } catch (e) {
        console.error(e.message);
        res.status(400).send(e.message);
    }
})

module.exports = router;
