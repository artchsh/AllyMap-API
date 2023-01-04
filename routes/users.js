const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const schema = require('../models/model')
const uuid = require('uuid')
const errors = require('../errors')
const jwt = require('jsonwebtoken')
const security = require('../config/secutiry')

// function that generates invite code for user
function generateInviteCode() {
    const length = 8,
        charset = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

router.post('/login', (req, res) => {
    const login = req.body.login
    schema.user.findOne({ login }, (err, docs) => {
        if (err) { throw err }
        if (docs == null) {
            return res.json(errors.accNotFound).status(401)
        }
        const password = req.body.password
        const hash = docs.password
        bcrypt.compare(password, hash, function (err, result) {
            if (err) { res.json(errors.internalError).status(500) }
            if (result) {
                let updatedDocs = {
                    _id: docs._id,
                    login: docs.login,
                    acceptCode: docs.acceptCode,
                    inviteCode: docs.inviteCode
                } // uuid.v4()
                let token = jwt.sign(updatedDocs, security.JWT_SECRET)
                schema.user.findOneAndUpdate({_id: docs._id}, { token }, (err, docs) => {
                    if (err) { res.json(errors.internalError).status(500) }
                    res.json({
                        token,
                        docs: updatedDocs,
                        expiresIn: 360
                    })
                })
            }
        })
    })
})

router.post('/register', (req, res) => {
    const saltRounds = 10
    const password = req.body.password

    // generate salt and hash for password encryption
    bcrypt.genSalt(saltRounds, function (err, salt) {
        if (err) { return res.json(errors.internalError).status(500) }
        bcrypt.hash(password, salt, function (err, hash) {
            if (err) { return res.json(errors.internalError).status(500) }
            // get invite code from request body
            let inviteCode = req.body.inviteCode
            // find user that have that invite code for somebody
            schema.user.findOne({ inviteCode }, (err, docs) => {
                // проверить не пустой ли docs
                if (!docs) {
                    return res.json(errors.invCodeNotFound).status(401)
                }

                // write new user to database
                const userNew = new schema.user({
                    login: req.body.login,
                    password: hash.toString(),
                    acceptCode: inviteCode.toString(),
                    inviteCode: generateInviteCode()
                })
                userNew.save((err, docs) => {
                    console.log(err)
                    if (err) { return res.json(errors.internalError).status(500) }
                    res.json(docs)
                })
            })
        })
    })
})

router.post('/update', (req, res) => {
    // { query: { _id: 'some_id_here' }, update: { password: 'new_password_hash'} }
    schema.user.findOneAndUpdate(req.body.query, req.body.update, (err, docs) => {
        if (err) { res.json(errors.internalError).status(500) }
        res.json(docs)
    })
})

router.post('/find', (req, res) => {
    // { query: { token: 'some_token_here' } }
    schema.user.findOne(req.body.query, (err, docs) => {
        if (err) { res.json(errors.internalError).status(500) }
        else if (docs == null) { res.json(errors.internalError).status(500) }
        else { res.json(docs) }
    })
})

router.post('/remove', (req, res) => {
    schema.user.findOneAndRemove(req.body.query, (err, docs) => {
        if (err) { res.json(errors.internalError).status(500) }
        else if (docs == null) { res.json(errors.internalError).status(500) }
        else { res.json(docs) }
    })
})

router.post('/find/all', (req, res) => {
    // { query: { token: 'some_token_here' } }
    schema.user.find({}, (err, docs) => {
        if (err) { res.json(errors.internalError).status(500) }
        else if (docs == null) { res.json(errors.internalError).status(500) }
        else { res.json(docs) }
    })
})

module.exports = router
