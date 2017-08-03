'use strict'
const User = require('../models/user')

module.exports = {
  setPersonal (user, personal) {
    return new Promise((resolve, reject) =>
      User.findOneAndUpdate({
        'local.email': user
      }, {
        $set: {
          personal: personal
        }
      }, (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }))
  },
  byEmail (email) {
    return new Promise((resolve, reject) =>
      User.findOne({ 'local.email': email },
        (err, result) => err ? reject(err) : resolve(result)
      )
    )
  }
}
