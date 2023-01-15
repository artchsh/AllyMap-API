const express = require('express')
const router = express.Router()
const schema = require('../models/model')
const errors = require('../config/errors')
const multer = require('multer')
const fs = require('fs')
const sharp = require('sharp')
const uuid = require('uuid')

const storage = multer.memoryStorage()
const upload = multer({ dest: 'images/', storage })

router.post('/find', (req, res) => {
    schema.institution.find(req.body.query || {}, (err, docs) => {
        if (err) { return res.json(errors.internalError).status(500) }
        if (docs) { res.json(docs) }
    })
})

// Add new institution
router.post('/add', (req, res) => {
    const institution = new schema.institution(req.body)
    institution.save((err, docs) => {
        if (err) { return res.json(errors.internalError).status(500) }
        res.json(docs)
    })
})

// Remove existing institution
router.post('/remove', (req, res) => {
    // { query: { id } }
    schema.institution.findOneAndDelete(req.body.query, (err, docs) => {
        if (err) { return res.json(errors.internalError).status(500) }
        if (docs.imagePath != '' && docs.imagePath != undefined) {
            let imagePathBeforeFormat = docs.imagePath
            let path = imagePathBeforeFormat.replace(/\\/g, "/")
            fs.unlink(path, (err) => {
                if (err) { return res.json(errors.internalError).status(500) }
                console.log(`Deleted file ${path}`)
            })
        }
        schema.comment.find({ institutionID: req.body.query._id }, (err, docs) => {
            if (err) { return res.json(errors.internalError).status(500 )}
            if (docs != null || docs != []) {
                for (let i = 0; i < docs.length; i++) {
                    schema.comment.findOneAndRemove({ _id: docs[i]._id}, (err, docs) => {
                        if (err) { return res.json(errors.internalError).status(500) }
                    })
                }
            }
        })
        res.json(docs)
    })
})

// Edit existing instituion
router.post('/edit', (req, res) => {
    // { query: { id }, updated: { address: ryskulova } }
    schema.institution.findOneAndUpdate(req.body.query, req.body.updated, (err, docs) => {
        if (err) { return res.json(errors.internalError).status(500) }
        else { res.json(docs) }
    })
})

// Create new request for new institution
router.post('/request/new', upload.single('image'), async (req, res) => {
    let imagePath = ''
    if (req.file != undefined) {
        fs.access("./images", (error) => {
            if (error) {
                fs.mkdirSync("./images")
            }
        })
        const { buffer } = req.file
        const ref = `${uuid.v4()}.webp`
        await sharp(buffer).webp({ quality: 20 }).toFile("./images/" + ref)
        imagePath = `images/${ref}`
    }
    let requestInstitutionBody = {
        title: req.body.title,
        description: req.body.description,
        userRequestID: req.body.userRequestID,
        link: req.body.link,
        address: req.body.address,
        imagePath: imagePath,
        city: req.body.city
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
        if (err) { return res.json(errors.internalError).status(500) }
        const newInstitutionDocs = {
            title: docs.title,
            description: docs.description,
            link: docs.link,
            userID: docs.userRequestID,
            address: docs.address,
            status: '',
            // ['grey', 'Новенький'],
            imagePath: docs.imagePath,
            city: docs.city
        }
        const instituion = new schema.institution(newInstitutionDocs)
        instituion.save((err, docs) => {
            if (err) { return res.json(errors.internalError).status(500) }
            res.json(docs)
        })
    })
})

// Decline request for new institution
router.post('/request/decline', (req, res) => {
    // { query: { ID: ID } }
    schema.requestInstitution.findOneAndRemove(req.body.query, (err, docs) => {
        if (err) { return res.json(errors.internalError).status(500) }
        if (docs.imagePath != '' && docs.imagePath != undefined) {
            let path = docs.imagePath.replace(/\\/g, "/")
            fs.unlink(path, (err) => {
                if (err) { return res.json(errors.internalError).status(500) }
                console.warn(`Deleted file ${path}`)
            })
        }
        res.json(docs)
    })

})

router.post('/request/find', (req, res) => {
    // { query: { someid } }
    schema.requestInstitution.find(req.body.query || {}, (err, docs) => {
        if (err) { return res.json(errors.internalError).status(500) }
        res.json(docs)
    })
})

module.exports = router
