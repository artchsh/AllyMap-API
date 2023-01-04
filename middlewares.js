const schema = require('./models/model')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const security = require('./config/secutiry')

module.exports = {
    authenticate: (req, res, next) => {
        // Retrieve token from header
        const authorizationHeader = req.headers['authorization']
        // Reserving variable for token
        let token
        // Get received token
        if (authorizationHeader) token = authorizationHeader.split(' ')[1]
        // Paths whitelist
        const pathsWhitelists = ['/users/login','/users/register','/config','/config/']
        // Bypass authorization middleware if path includes "users/login" or "users/register"
        if (pathsWhitelists.includes(req.path)) {
            next()
        }
        else if (req.path.split("/").includes('images')) {
            next()
        }
        // Token exists then validate to provide access or not
        else if (token && !validator.isEmpty(token)) {
            // Validate token with the secret
            jwt.verify(token, security.JWT_SECRET, (err, decoded) => {
                if (err) {
                    res.status(401).json({ err: 'Authentication refused! Unauthorized action.' })
                    res.end()
                } else {
                    // Suggest - You can check database here if you want to save it

                    next() // Let de request proceed to it's endpoint naturally
                }
            })
        } else {
            res.status(401).json({ err: "Unauthorized! You must be logged in to use this service!" })
            res.end()
        }
    },
    logger: (req, res, next) => {
        console.log(req.hostname, req.method, req.originalUrl)
        next()
    }
}