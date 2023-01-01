const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

// express setup
const app = express()
const port = process.env.PORT || 3000

// var whitelist = ['https://slp-client-ba3ni.ondigitalocean.app', 'http://dev.artchsh.top']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }
app.use(cors())

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//mongoose setup
const url = process.env.MONGO_DB || 'mongodb://localhost:27017/'
mongoose.set('strictQuery', true);
async function mongooseConnect () { await mongoose.connect(url) }
mongooseConnect().catch(err => console.log(err))
const db = mongoose.connection
db.once('open', _ => {
  console.log('Database connected:', url)
})
db.on('error', err => {
  console.error('Сonnection error:', err)
})

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

// express listen
app.listen(port, () => {
  console.log(`BackEnd listening on port ${port}`)
})