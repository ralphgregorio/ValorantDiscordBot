const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    _id: String,
    val_username: String,
    puuid: String,
    username: String
})

module.exports = mongoose.model('users', userSchema)