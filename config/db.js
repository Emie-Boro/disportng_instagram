const mongoose = require('mongoose')


const connectDB = async function() {
    try {
        const conn = await mongoose.connect('mongodb://localhost:27017/disportNG')

        console.log('MongoDB Connected...')
    } catch (err) {
        console.log(err)
    }
}

module.exports = connectDB