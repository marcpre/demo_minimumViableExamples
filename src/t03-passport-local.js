require('dotenv').config()
const express = require('express')
const path = require('path')
const logger = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

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
app.use(passport.initialize())
app.use(passport.session())

function authenticate() {
    passport.serializeUser((user, done) => {
        done(null, user.id)
      })
      
      passport.deserializeUser(async (id, done) => {
        const user = await serviceAuth.findById(id)
        done(null, user)
      })
      
      // Sign in with username and Password
      passport.use('local', new LocalStrategy({
        usernameField: 'username',
      }, async(username, password, done) => {
        const user = await serviceAuth.signin(username, password)
        done(null, user)
      }))
}

// routes
app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user) => {
      if (err) return next(err)
      if (!user) return res.status(401).json({ error: 'Email or password is incorrect.' })
  
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
