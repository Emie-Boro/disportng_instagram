const mongoose = require('mongoose')

const storySchema = mongoose.Schema({
    name:String,
    title: String,
    content: String,
    phone: String,
    email:String,
    state:String
})

const Story = mongoose.model('Story', storySchema)

module.exports = Story