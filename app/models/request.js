'use strict'
const mongoose = require('mongoose')

// define the schema for our user model
const Request = mongoose.Schema({
  bookId: String,
  owner: String,
  newOwner: String,
  granted: Boolean,
  denied: Boolean
})

// create the model for users and expose it to our app
module.exports = mongoose.model('Request', Request)
