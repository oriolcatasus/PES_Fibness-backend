const chai = require('chai')

//Middleware
chai.use(require('chai-things'))
chai.use(require('chai-as-promised')) //Must be the last one

module.exports = chai.expect