const express = require('express')
const router = express.Router()
const schema = require('../models/model')
const errors = require('../errors')
const multer = require('multer')
const fs = require('fs')

router.use(logger)
function logger(req, res, next) {
    console.log(req.originalUrl)
    next()
}

const upload = multer({ dest: 'images/' })

router.get('/', (req, res) => {
    res.json('institutions API')
})

router.post('/find', (req, res) => {
    schema.institution.find(req.body.query || {}, (err, docs) => {
        if (err) { return res.json(errors.internalError) }
        else { res.json(docs) }
    })
})

// Add new institution
router.post('/add', (req, res) => {
    const institution = new schema.institution(req.body)
    if (req.body.title) {
        institution.save((err, docs) => {
            if (err) { return res.json(errors.internalError) }
            res.json(docs)
        })
    } else { return res.json(errors.fieldsEmpty) }
})

// Remove existing institution
router.post('/remove', (req, res) => {
    // { query: { id } }
    schema.institution.deleteOne(req.body.query, (err, docs) => {
        if (err) { return res.json(errors.internalError) }
        if (docs.imagePath != '' && docs.imagePath != undefined) {
            let imagePathBeforeFormat = docs.imagePath
            let path = imagePathBeforeFormat.replace(/\\/g, "/")
            fs.unlink(path, (err) => {
                if (err) { return res.json(errors.internalError) }
                console.log(`Deleted file ${path}`)
            })
        }
        res.json(docs)
    })
})

// Edit existing instituion
router.post('/edit', (req, res) => {
    // { query: { id }, updated: { address: ryskulova } }
    schema.institution.findOneAndUpdate(req.body.query, req.body.updated, (err, docs) => {
        if (err) { return res.json(errors.internalError) }
        else { res.json(docs) }
    })
})

// Create new request for new institution
router.post('/request/new', upload.single('image'), (req, res) => {
    let imagePath = ''
    if (req.file != undefined) {
        imagePath = req.file.path
    }
    let requestInstitutionBody = {
        title: req.body.title,
        description: req.body.description,
        userRequestID: req.body.userRequestID,
        link: req.body.link,
        address: req.body.address,
        imagePath: imagePath
    }
    const newRequestInstitution = new schema.requestInstitution(requestInstitutionBody)
    newRequestInstitution.save((err, docs) => {
        if (err) { return res.json(err) }
        res.json(docs)
    })
})

// Accept request for new institution
router.post('/request/accept', (req, res) => {
    // { query: { ID: ID } }
    schema.requestInstitution.findOneAndDelete(req.body.query, (err, docs) => {
        if (err) { return res.json(errors.internalError) }
        const newInstitutionDocs = {
            title: docs.title,
            description: docs.description,
            link: docs.link,
            userID: docs.userRequestID,
            address: docs.address,
            status: ['grey', 'Новенький'],
            imagePath: docs.imagePath
        }
        const instituion = new schema.institution(newInstitutionDocs)
        instituion.save((err, docs) => {
            if (err) { return res.json(errors.internalError) }
            res.json(docs)
        })
    })
})

// Decline request for new institution
router.post('/request/decline', (req, res) => {
    // { query: { ID: ID } }
    schema.requestInstitution.findOneAndRemove(req.body.query, (err, docs) => {
        if (err) { return res.json(errors.internalError) }
        if (docs.imagePath != '' && docs.imagePath != undefined) {
            let path = docs.imagePath.replace(/\\/g, "/")
            fs.unlink(path, (err) => {
                if (err) { return res.json(errors.internalError) }
                console.warn(`Deleted file ${path}`)
            });
        }
        res.json(docs)
    })

})

router.post('/request/find', (req, res) => {
    // { query: { someid } }
    schema.requestInstitution.find(req.body.query || {}, (err, docs) => {
        if (err) { return res.json(errors.internalError) }
        res.json(docs)
    })
})

module.exports = router
