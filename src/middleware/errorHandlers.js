function validation(err, req, res, next) {
    console.log(err.message);
    /*if (err.name == "JsonSchemaValidationError") {
        res.status(400).send(err.validationError);
    } else {*/
        next(err);
    //}
}

function def(err, req, res, next) {
    res.status(500).send(err.message);
}

module.exports = {
    validation,
    def
}