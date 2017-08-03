'use strict'
const personalController = require('./controllers/personal')
const bookController = require('./controllers/book')
const requestController = require('./controllers/request')

module.exports = function (app, passport) {
  app.get('/', function (req, res) {
    // get the user out of session and pass to template
    res.locals.user = req.user
    bookController.all()
      .then(books => res.render('index', { books }))
  })

  app.route('/login')
    .get((req, res) => {
      res.locals.message = req.flash('loginMessage')
      // render the page and pass in any flash data if it exists
      res.render('login')
    })
    .post(passport.authenticate('local-login', {
      // redirect to the secure profile section
      successRedirect: '/',
      // redirect back to the signup page if there is an error
      failureRedirect: '/login',
      // allow flash messages
      failureFlash: true
    }))

  app.route('/signup')
    .get((req, res) => {
      // render the page and pass in any flash data if it exists
      res.locals.message = req.flash('signupMessage')
      res.render('signup')
    })
    .post(passport.authenticate('local-signup', {
      // redirect to the secure profile section
      successRedirect: '/profile',
      // redirect back to the signup page if there is an error
      failureRedirect: '/signup',
      // allow flash messages
      failureFlash: true
    }))

  app.route('/profile')
    .get(isLoggedIn, (req, res) => {
      res.render('profile', {
        personal: req.user.personal
      })
    })
    .post(isLoggedIn, (req, res) => {
      const personal = {
        fullName: req.body.fullName,
        state: req.body.state,
        city: req.body.city
      }
      personalController.setPersonal(req.user.local.email, personal)
        .then(() => res.redirect('/'))
        .catch(err => console.error(err))
    })
  app.route('/profile/:email')
    .get(isLoggedIn, (req, res) => {
      personalController.byEmail(req.params.email)
        .then(result => res.render('profileStranger', {
          personal: result.personal,
          email: result.local.email
        }))
        .catch(err => console.error(err))
    })
  app.route('/new')
    .get(isLoggedIn, (req, res) =>
      res.render('newBook')
    )
    .post(isLoggedIn, (req, res) => {
      const book = {
        name: req.body.name,
        imgUrl: req.body.imgUrl,
        owner: req.user.local.email,
        newOwner: null
      }
      bookController.newBook(book)
        .then(() => res.redirect('/'))
        .catch(err => console.error(err))
    })
  app.get('/requests/new/:bookId', isLoggedIn, (req, res) =>
    requestController.newRequest(req.params.bookId, req.user.local.email)
    .then(() => res.redirect('/requests'))
    .catch(err => console.error(err))
  )
  app.get('/requests/grant/:id', isLoggedIn, (req, res) =>
    requestController.grant(req.params.id, req.user.local.email)
    .then(() => res.redirect('/requests'))
    .catch(err => console.error(err))
  )
  app.get('/requests/deny/:id', isLoggedIn, (req, res) =>
    requestController.deny(req.params.id, req.user.local.email)
    .then(() => res.redirect('/requests'))
    .catch(err => console.error(err))
  )
  app.get('/requests', isLoggedIn, (req, res) =>
    Promise.all([
      requestController.byOwner(req.user.local.email),
      requestController.byNewOwner(req.user.local.email)
    ])
    .then(requests => {
      console.log(requests)
      res.render('requests', {
        incomingRequests: requests[0],
        requests: requests[1]
      })
    })
    .catch(err => console.error(err))
  )
  app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
  })
}

// route middleware to make sure a user is logged in
function isLoggedIn (req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) {
    // get the user out of session and pass to template
    res.locals.user = req.user
    return next()
  }
  // if they aren't redirect them to the home page
  res.redirect('/')
}
