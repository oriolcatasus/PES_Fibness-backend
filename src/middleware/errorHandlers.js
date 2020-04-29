function validation(err, req, res, next) {
    console.log(err.message);
    next(err);
}

function def(err, req, res, next) {
    res.status(500).send(err.message);
}

module.exports = {
    validation,
    def
}
