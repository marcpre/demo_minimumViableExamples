const express = require('express')
const path = require('path')
const logger = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false,
}))
app.use(express.static(path.join(__dirname, 'public'))) // public folder!
app.use(cookieParser())

// session
app.use(session({
  key: 'user_sid',
  secret: 'sessionSecret',
  resave: true,
  saveUninitialized: false,
  cookie: {
    expires: 600000,
  },
}))

const sessionChecker = (req, res, next) => {
  if (req.session.user) {
    // const id = res.locals.user
    // const user = await userService.findUserById(id)
    next()
  } else {
    res.redirect('login')
  }
}

// Check if user's cookie is still saved in browser and user is not set
// else automatically log the user out
app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie('user_sid')
  }
  next()
})

/*
 * Routes
 */

app.post('/login', sessionChecker, (req, res) => {
  res.send('Hello World!')
})

app.get('/', sessionChecker, (req, res) => {
  res.send('Hello World!')
})

/*
 * Server
 */
// Start Server
const port = process.env.APP_PORT || 8080
const host = process.env.APP_HOST || 'localhost'

app.listen(port, () => {
  console.log(`Listening on ${host}:${port}`)
})

module.exports = app
