'use strict'

const mongoose = require('mongoose')

// Institution's schema
const institutionSchema = mongoose.Schema({
    title: { type: String, unique: true },
    description: { type: String, default: '' },
    userID: { type: String },
    status: { type: Array, default: [] },
    address: { type: String },
    link: { type: String, default: '' },
    imagePath: { type: String, default: '' },
    city: { type: String, default: '' }
})

// RequestInstitution's schema
const requestInstitutionSchema = mongoose.Schema({
    userRequestID: { type: String },
    title: { type: String, unique: true },
    address:{ type: String },
    description: { type: String, default: '' },
    link: { type: String, default: '' },
    imagePath: { type: String, default: '' },
    city: { type: String, default: '' }
})

// Comment's schema
const commentSchema = mongoose.Schema({
    userID: { type: String },
    institutionID: { type: String },
    date: String,
    dateStamp: String,
    content: { type: String, default: '' },
    rate: String,
})

// User's schema
const userSchema = mongoose.Schema({
    login: { type: String, unique: true },
    password: { type: String, default: '' },
    inviteCode: { type: String, default: '', unique: true },
    acceptCode: { type: String, default: ''},
    token: { type: String, default: '' }
})

// Config schema
const configSchema = mongoose.Schema({
    admins: { type: Array, default: []},
    name: { type: String, default: 'SafeZone Finder'},
    version: { type: String, default: 'v1.0.0'}
})

exports.user = mongoose.model('User', userSchema)
exports.comment = mongoose.model('Comment', commentSchema)
exports.institution = mongoose.model('Institution', institutionSchema)
exports.requestInstitution = mongoose.model('RequestInstitution', requestInstitutionSchema)
exports.config = mongoose.model('Config', configSchema)
