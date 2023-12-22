const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: String,
    name: String,
    password: String,
    phone: String,
    email:String,
})

const User = mongoose.model('User', userSchema)

module.exports = User