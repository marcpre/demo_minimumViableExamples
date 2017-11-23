require('dotenv').config()
const express = require('express')
const fs = require('fs')
const path = require('path')
const logger = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const acl = require('acl')

// load user.json file
const d = fs.readFileSync(path.join(__dirname, '/../data/user.json'))
const userObj = JSON.parse(d)

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use(logger(process.env.LOG_ENV))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false,
}))
app.use(express.static(path.join(__dirname, '/../public')))
app.use(cookieParser())

app.use(session({
  secret: 'super-mega-hyper-secret',
  resave: false,
  saveUninitialized: false,
}))

/**
 * Passport Local
 */
app.use(passport.initialize())
app.use(passport.session())

function authenticate() {
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser(async(id, done) => {
    //        const user = await serviceAuth.findById(id)
    const user = userObj.find(item => item.id === id)
    done(null, user)
  })

  // Sign in with username and Password
  passport.use('local', new LocalStrategy({
    usernameField: 'username',
  }, async(username, password, done) => {
    const user = userObj.find(item => item.username === username)
    done(null, user)
  }))
}

authenticate()

/**
 * Node ACL
 */

function accessControl() {
  acl = new acl(new acl.memoryBackend())

  acl.allow([{
    roles: 'admin',
    allows: [{
      resources: '/admin',
      permissions: '*',
    }],
  }, {
    roles: 'user',
    allows: [{
      resources: '/dashboard',
      permissions: 'get',
    }],
  }, {
    roles: 'guest',
    allows: [],
  }])

  // Inherit roles
  //  Every user is allowed to do what guests do
  //  Every admin is allowed to do what users do
  acl.addRoleParents('user', 'guest')
  acl.addRoleParents('admin', 'user')
}

// routes
app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) return next(err)
    if (!user) {
      return res.status(401).json({
        error: 'Email or password is incorrect.',
      })
    }

    return res.render('dashboard')
  })(req, res, next)
})

// Start Server
const port = process.env.APP_PORT || 8080
const host = process.env.APP_URL || 'localhost'

app.listen(port, host, () => {
  console.log(`Listening on ${host}:${port}`)
})

module.exports = app
