function validationE(err, req, res, next) {
    if (err.name == "JsonSchemaValidationError") {
        res.status(400).send(err.validationError);
    } else {
        next(error);
    }
}

function default(err, req, res, next) {
    res.status(500).send(err.message);
}

module.exports = {
    validation,
    default
}