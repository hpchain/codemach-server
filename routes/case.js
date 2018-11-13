'use strict'

const express = require('express')
const router = express.Router()
const co = require('co')
const path = require('path')
const util = require('../util')
const debug = require('debug')('service:case')

// /case page
router.get('/', function (req, res, next) {
  res.send('case service')
})

// 获取合约事例
router.get('/list', function (req, res, next) {
  co(function * () {
    try {
      const contractDir = path.join(__dirname, '../public/contract')
      const list = yield util.getFilesFromDir(contractDir)
      res.send({
        errorCode: 0,
        errorDesc: '',
        result: list
      })
    } catch (err) {
      debug(err.message)
    }
  }).catch(function (err) {
    debug(err)
  })
})

module.exports = router
