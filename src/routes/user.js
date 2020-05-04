const express = require("express");

const user = require("../models/userModel");

const router = express.Router();


router.post('/', async function(req, res, next) {
    try {
        const result = await user.create(req.body);
        if (result.created) {
            res.status(201);
        } else {
            res.status(400);
        }
        res.send(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

router.delete('/:id', async function(req, res, next) {
    try {
        await user.del(req.params.id);
        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
});

router.post('/validate', async function(req, res, next) {
    try {
        const valid = await user.validate(req.body);
        res.send(valid);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

router.get('/:id/trainings', async function(req, res, next) {
    try {
        const trainingSet = await user.trainings(req.params.id);
        res.status(200).send(trainingSet);
    } catch (err) {
        next(err);
    }
});

router.get('/:id/diets', async function(req, res, next) {
    try {
        const dietSet = await user.diets(req.params.id);
        res.status(200).send(dietSet);
    } catch (err) {
        next(err);
    }
});

router.put('/resetPassword', async function(req, res, next) {
    try {
        const valid = await user.resetPassword(req.body);
        res.status(200).send(valid);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

router.get('/:id/info', async function(req, res){
    try {
        const info = await user.getInfo(req.params.id);
        res.status(200).send(info);
    } catch(err) {
        res.status(400).send(err.message);
    }
});

router.put(`/:id/info`, async function(req, res, next) {
    try {
        await user.putInfo(req.params.id, req.body);
        res.sendStatus(200);
    } catch(err) {
        res.status(400).send(err.message);
    }
});

router.put('/:id/settings', async function(req, res, next){
    try {
        await user.putSettings(req.params.id, req.body);
        res.sendStatus(200);
    } catch(err) {
        res.status(400).send(err.message);
    }
});

router.get('/:id/settings', async function(req, res, next){
    try {
        const settings = await user.getSettings(req.params.id);
        res.status(200).send(settings);
    } catch(err) {
        res.status(400).send(err.message);
    }
});

router.post('/fb', async function(req, res, next) {
    try {
        const result = await user.fbLogin(req.body);
        let status;
        if (result.created === true) {
            status = 201;
        } else {
            status = 200;
        }
        const id = result;
        res.status(status).send(id);
    } catch (err) {
        next(err);
    }
});

router.get('/:id/profile', async function(req, res, next) {
    try {
        const id = req.params.id
        const pathImg = await user.getProfileImg(id)
        res.status(200).sendFile(pathImg)
    } catch (err) {
        next(err)
    }
})

router.post('/:id/profile', async function(req, res, next) {
    try {
        const id = req.params.id
        const img = req.body
        const ext = req.get('Content-Type').split('/')[1]
        await user.setProfileImg(id, img, ext)
        res.sendStatus(201)
    } catch (err) {
        next(err)
    }
})


module.exports = router;
