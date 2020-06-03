const express = require("express");

const likeelemento = require("../models/likeelementoModel");

const router = express.Router();


router.get('/:idElemento/:idUser', async function(req, res, next) {
    try {
        const like = await likeelemento.liked(req.params.idElemento, req.params.idUser);
        res.status(200).send(like);
    } catch (err) {
        res.status(400).send(err.message);
    }
});



module.exports = router;
