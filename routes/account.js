'use strict'

const debug = require('debug')('service:account')
const express = require('express')
const router = express.Router()
const co = require('co')
const BigNumber = require('bignumber.js')
const util = require('../util')

// /account page
router.get('/', function (req, res, next) {
  res.send('account service')
})

// 获取账户余额
router.get('/getBalance', function (req, res, next) {
  co(function * () {
    try {
      const { address } = req.query
      const info = yield req.sdk.account.getBalance(address)
      res.send(info)
    } catch (err) {
      debug(err.message)
    }
  }).catch(function (err) {
    debug(err)
  })
})

// 充值
router.post('/recharge', function (req, res, next) {
  co(function * () {
    try {
      if (req.sdkEnv !== 'sandbox') {
        return res.send({
          errorCode: 1,
          errorDesc: 'This functionality only support sandbox environment'
        })
      }

      const address = req.body.address
      // Get address balance
      const balanceInfo = yield req.sdk.account.getBalance(address)

      if (balanceInfo.errorCode !== 0 && balanceInfo.errorCode !== 15001) {
        return res.send(balanceInfo)
      }

      let currentBalance = null
      if (balanceInfo.errorCode === 15001) {
        currentBalance = 0
      } else {
        currentBalance = balanceInfo.result.balance
      }

      const balance = new BigNumber(currentBalance)

      // balance >= 1500000000
      if (balance.isGreaterThanOrEqualTo(BigNumber(15 * Math.pow(10, 8)))) {
        return res.send({
          errorCode: -1,
          errorDesc: 'Current balance is enough'
        })
      }
      const privateKey = req.privateKey
      const sourceAddress = util.getAddressFromPrivateKey(privateKey)
      const destAddress = address

      const nonceInfo = yield req.sdk.account.getNonce(sourceAddress)

      if (nonceInfo.errorCode !== 0) {
        debug('get nonce error')
        debug(nonceInfo)
        return res.send(nonceInfo)
      }

      let nonce = nonceInfo.result.nonce
      nonce = new BigNumber(nonce).plus(1).toString(10)

      // 1.build operation
      const buSendOperation = req.sdk.operation.buSendOperation({
        destAddress,
        buAmount: req.sdk.util.buToMo('100')
      })

      if (buSendOperation.errorCode !== 0) {
        debug('buSendOperation error')
        debug(buSendOperation)
        return res.send(buSendOperation)
      }

      const operationItem = buSendOperation.result.operation

      const feeData = yield req.sdk.transaction.evaluateFee({
        sourceAddress,
        nonce,
        operations: [ operationItem ],
        signtureNumber: '1'
      })

      if (feeData.errorCode !== 0) {
        debug('evaluate fee error')
        debug(feeData)
        return res.send(feeData)
      }

      // 2. build blob
      const blobInfo = req.sdk.transaction.buildBlob({
        sourceAddress,
        gasPrice: feeData.result.gasPrice,
        feeLimit: feeData.result.feeLimit,
        nonce,
        operations: [ operationItem ]
      })

      if (blobInfo.errorCode !== 0) {
        debug('build blob errror')
        debug(blobInfo)
        return res.send(blobInfo)
      }

      const blob = blobInfo.result.transactionBlob

      // 3. sign blob
      const signatureInfo = req.sdk.transaction.sign({
        privateKeys: [ privateKey ],
        blob
      })

      if (signatureInfo.errorCode !== 0) {
        debug('signature error')
        debug(signatureInfo)
        return res.send(signatureInfo)
      }

      const signature = signatureInfo.result.signatures
      // 4. submit transaction
      const transactionInfo = yield req.sdk.transaction.submit({
        blob,
        signature
      })

      return res.send(transactionInfo)
    } catch (err) {
      debug(err)
    }
  }).catch(function (err) {
    debug(err)
  })
})

module.exports = router
