const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const helpers = require('./utils/helpers')

// express setup
const app = express()
const port = process.env.PORT || 3000
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(helpers.logger)

// CORS setup
const whitelist = ['http://kz.allymap.info', 'https://kz.allymap.info', 'http://localhost:5173']
app.use(cors({
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      if (origin == undefined) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    }
  },
  methods: ['GET', 'POST', 'OPTIONS']
}))

//mongoose setup
const url = process.env.MONGO_DB || 'mongodb://localhost:27017/'
mongoose.set('strictQuery', true);
async function mongooseConnect() { await mongoose.connect(url) }
mongooseConnect().catch(err => console.log(err))
const db = mongoose.connection

// express routes setup
const institutionRoute = require('./routes/institutions')
app.use('/institutions', institutionRoute)
const userRoute = require('./routes/users')
app.use('/users', userRoute)
const commentRoute = require('./routes/comments')
app.use('/comments', commentRoute)
const configRoute = require('./routes/config')
app.use('/config', configRoute)

app.use('/images', express.static('images'))

app.get('/api', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  db.once('open', _ => {
    const API = { name: 'ExpressJS', status: `AllyMap API listening on port - ${port}` }
    const MONGODB = { name: 'MongoDB', status: `Database connected: ${url}` }
    console.table([API, MONGODB], ['name', 'status'])
  })
  db.on('error', err => {
    console.error('Сonnection error:', err)
  })
})