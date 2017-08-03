'use strict'
const Book = require('../models/book')

module.exports = {
  all () {
    return new Promise((resolve, reject) =>
      Book.find({}, (err, result) => err ? reject(err) : resolve(result)))
  },
  newBook (book) {
    return new Promise((resolve, reject) => {
      let newBook = new Book(book)
      newBook.save((err, result) => err ? reject(err) : resolve(result))
    })
  },
  byId (id) {
    return new Promise((resolve, reject) => Book.findById(id,
      (err, result) => err ? reject(err) : resolve(result)
    ))
  },
  byOwner (email, done) {
    Book.find({
      owner: email
    }, done)
  },
  deleteById (id, done) {
    Book.deleteOne({
      _id: id
    }, done)
  },
  update (book) {
    return new Promise((resolve, reject) =>
      Book.findOneAndUpdate({
        _id: book._id
      }, book, (err, result) => err ? reject(err) : resolve(result))
    )
  }
}
