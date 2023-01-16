const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const middlewares = require('./utils').middlewares
const security = require('./config/security')
const helmet = require('helmet')

// express setup
const app = express()
const port = process.env.PORT || 3000

// middlewares
const whitelist = [
  'http://kz.allymap.info',
  'https://kz.allymap.info',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://192.168.1.72:4173',
  'http://192.168.1.72:5173',
  'hammerhead-app-q63fx.ondigitalocean.app'
]
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true)
    // console.log('--------------------')
    // console.log(origin)
    // if (whitelist.indexOf(origin) !== -1 || whitelist.includes(origin)) {
    //   callback(null, true)
    // } else {
    //   if (origin == undefined) {
    //     callback(null, true)
    //   } else {
    //     callback(new Error('Not allowed by CORS'))
    //   }
    // }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
}))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(middlewares.logger)
app.use(middlewares.authenticate)
app.use(helmet.dnsPrefetchControl())
app.use(helmet.expectCt())
app.use(helmet.frameguard())
app.use(helmet.hidePoweredBy())
app.use(helmet.hsts())
app.use(helmet.ieNoOpen())
app.use(helmet.noSniff())
app.use(helmet.originAgentCluster())
app.use(helmet.permittedCrossDomainPolicies())
app.use(helmet.referrerPolicy())
app.use(helmet.xssFilter())


//mongoose setup
const url = process.env.MONGO_DB || 'mongodb://localhost:27017/'
mongoose.set('strictQuery', true)
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
    const API = { name: 'API_PORT', value: port }
    const MONGODB = { name: 'MONGODB_URL', value: url }
    const JWT_SECRET = { name: 'JWT_SECRET', value: security.JWT_SECRET }
    const ACCESS_KEY_ID = { name: 'ACCESS_KEY_ID', value: security.accessKeyId }
    const SECRET_ACCESS_KEY = { name: 'SECRET_ACCESS_KEY', value: security.secretAccessKey }
    const array = [API, MONGODB, JWT_SECRET, ACCESS_KEY_ID, SECRET_ACCESS_KEY]
    const transformed = array.reduce((acc, {name, ...x}) => { acc[name] = x; return acc}, {})
    console.table(transformed)
  })
  db.on('error', err => {
    console.error('Сonnection error:', err)
  })
})