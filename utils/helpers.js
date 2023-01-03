const schema = require('../models/model')

function logger(req, res, next) {
    console.log(req.hostname ,req.method, req.originalUrl)
    next()
}

function checkAuth(req, res, next) {
    
}

exports.logger = logger