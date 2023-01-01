const express = require('express')
const router = express.Router()
const schema = require('../models/model')
const errors = require('../errors')

router.use(logger)

function logger(req, res, next) {
    console.log(req.originalUrl)
    next()
}

router.get('/', (req, res) => {
    schema.config.findOne({}, (err, docs) => {
        if (err) { res.json(errors.internalError)}
        else if (docs == null) { res.json(errors.internalError)}
        else { res.json(docs) }
    })
})

router.get('/create', (req, res) => {
    const newConfig = new schema.config({
        admins: ['639f32ed1e7c8b26f1bceaac'],
        name: 'AllyMap',
        version: 'v1.7 dev'
    })
    newConfig.save((err, docs) => {
        if (err) { return res.json(errors.internalError) }
        res.json(docs)
    })
})

router.post('/update', (req, res) => {
    schema.config.findOneAndUpdate({}, req.body, (err, docs) => {
        if (err) { res.json(errors.internalError)}
        res.json(docs)
    })
})

module.exports = router
