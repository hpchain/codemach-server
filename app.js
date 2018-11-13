'use strict'

const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const BumoSDK = require('bumo-sdk')
const config = require('./config')
const index = require('./routes/index')
const caseRouters = require('./routes/case')
const account = require('./routes/account')
const contract = require('./routes/contract')

const app = express()
app.disable('x-powered-by')
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// CORS
// app.use(function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });

// Get SDK instance by type
app.use(function (req, res, next) {
  const sdkEnv = req.query.type || req.body.type || ''
  let host = null
  switch (sdkEnv) {
    case 'production':
      host = config.host.production
      break
    case 'development':
      host = config.host.development
      break
    default:
      host = config.host.sandbox
  }

  req.sdkEnv = sdkEnv

  const sdk = new BumoSDK({
    host
  })
  req.sdk = sdk
  req.privateKey = config.privateKey
  next()
})

app.use('/', index)
app.use('/case', caseRouters)
app.use('/account', account)
app.use('/contract', contract)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  // only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.status(err.status || 500)

  const template = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>${res.locals.error.status}</title>
    </head>
    <body>
        <h1>${res.locals.message}</h1>
        <h2>${res.locals.error.status || ''}</h2>
        <pre>${res.locals.error.stack || ''}</pre>
    </body>
    </html>
  `
  res.send(template)
})

module.exports = app
