const express = require('express')
const router = express.Router()
const schema = require('../models/model')
const errors = require('../errors')

router.post('/get', (req, res) => {
    // { query: { id: 'someid' } }
    schema.comment.find(req.body.query, (err, docs) => {
        if (err) { return res.json(errors.internalError).status(500) }
        if (docs) { res.json(docs) }
        else { res.json(errors.internalError.status(500)) }
    })
})

router.post('/add', (req, res) => {
    const date = new Date()
    const day = date.getDay()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const dateStamp = Date.now()
    const newComment = {
        userID: req.body.userID,
        institutionID: req.body.institutionID,
        date: `${day}-${month}-${year}`,
        content: req.body.content,
        dateStamp: dateStamp,
        rate: req.body.rate
    }
    const comment = new schema.comment(newComment)
    comment.save((err, docs) => {
        if (err) { return res.json(errors.internalError).status(500) }
        res.json(docs._id)
    })
})

router.post('/remove', (req, res) => {
    // { query: { _id: 'someid' } }
    schema.comment.findByIdAndRemove(req.body.query, (err, docs) => {
        if (err) { return res.json(errors.internalError).status(500) }
        res.json(docs)
    })
})

module.exports = router
