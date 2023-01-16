require('dotenv').config()
module.exports = {
	JWT_SECRET: process.env.JWT_SECRET || 'someSecret',
	accessKeyId: process.env.ACCESS_KEY_ID || 'none',
	secretAccessKey: process.env.SECRET_ACCESS_KEY || 'none',
}