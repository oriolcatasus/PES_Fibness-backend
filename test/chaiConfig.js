const chai = require('chai')

//Middlewares
chai.use(require('chai-like'))
chai.use(require('chai-things'))
chai.use(require('chai-as-promised')) //Must be the last one

module.exports = chai.expect
