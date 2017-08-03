'use strict'
const mongoose = require('mongoose')

// define the schema for our user model
const Book = mongoose.Schema({
  name: String,
  imgUrl: String,
  owner: String,
  newOwner: String
})

// create the model for users and expose it to our app
module.exports = mongoose.model('Book', Book)
