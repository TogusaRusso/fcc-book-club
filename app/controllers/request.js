'use strict'
const Request = require('../models/request')
const books = require('./book')

module.exports = {
  all () {
    return new Promise((resolve, reject) =>
      Request.find({}, (err, result) => err ? reject(err) : resolve(result)))
  },
  newRequest (bookId, newOwner) {
    return new Promise((resolve, reject) => books.byId(bookId)
      .then(book => {
        if (!book || book.newOwner) return resolve()
        let newRequest = new Request()
        newRequest.bookId = bookId
        newRequest.owner = book.owner
        newRequest.newOwner = newOwner
        newRequest.granted = null
        newRequest.denied = null
        newRequest.save((err, result) => err ? reject(err) : resolve(result))
      })
      .catch(reject)
    )
  },
  byId (id) {
    return new Promise((resolve, reject) =>
      Request.findById(id, (err, result) => err ? reject(err) : resolve(result))
    )
  },
  byOwner (email) {
    return find({ owner: email })
  },
  byNewOwner (email) {
    return find({ newOwner: email })
  },
  deleteById (id, done) {
    Request.deleteOne({
      _id: id
    }, done)
  },
  update (request) {
    return new Promise((resolve, reject) =>
      Request.findOneAndUpdate({
        _id: request._id
      }, request, (err, result) => err ? reject(err) : resolve(result))
    )
  },
  deny (id, email) {
    return new Promise((resolve, reject) =>
      this.byId(id)
      .then(request => {
        if (request.owner !== email) { return reject(new Error("This user can't deny request")) }
        this.update({
          _id: request._id,
          denied: true,
          granted: false,
          owner: request.owner,
          newOwner: request.newOwner,
          bookId: request.bookId
        })
          .then(resolve)
          .catch(reject)
      })
      .catch(reject)
    )
  },
  grant (id, email) {
    return new Promise((resolve, reject) =>
      this.byId(id)
      .then(request => {
        if (request.owner !== email) { return reject(new Error("This user can't grant request")) }
        books.byId(request.bookId)
          .then(book => {
            if (book.newOwner) { return reject(new Error('This book already granted')) }
            Promise.all([
              this.update({
                _id: request._id,
                denied: false,
                granted: true
              }),
              books.update({
                _id: book._id,
                owner: book.owner,
                newOwner: email
              })
            ])
              .then(resolve)
              .catch(reject)
          })
      })
      .catch(reject)
    )
  }
}

function find (query) {
  return new Promise((resolve, reject) => Request.find(query, (err, requests) => {
    if (err) return reject(err)
    const promises = requests.map(addBookName)
    Promise.all(promises)
      .then(resolve)
  }))
}

function addBookName (request) {
  return new Promise((resolve, reject) => books.byId(request.bookId)
    .then(book => resolve({
      bookName: book.name,
      bookNewOwner: book.newOwner,
      _id: request._id,
      denied: request.denied || (!request.granted && book.newOwner && book.newOwner !== request.newOwner),
      granted: request.granted || (!request.denied && book.newOwner && book.newOwner === request.newOwner),
      owner: request.owner,
      newOwner: request.newOwner,
      bookId: request.bookId
    }))
    .catch(reject)
  )
}
