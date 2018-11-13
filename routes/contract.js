'use strict'

const debug = require('debug')('service:contract')
const express = require('express')
const router = express.Router()
const co = require('co')
const BigNumber = require('bignumber.js')
const axios = require('axios')
const config = require('../config')

router.get('/', function (req, res, next) {
  res.send('contract service')
})

router.post('/release', function (req, res, next) {
  co(function * () {
    try {
      const sourceAddress = req.body.sourceAddress
      const contractCode = req.body.contractCode
      let input = req.body.input

      debug(req.sdkEnv)

      if (!sourceAddress || !contractCode) {
        return
      }

      // recharge when account balance is less then 10Bu
      // Get address balance
      const balanceInfo = yield req.sdk.account.getBalance(sourceAddress)

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

      if (balance.isLessThanOrEqualTo(BigNumber(15 * Math.pow(10, 8)))) {
        // const uri = `${config.host.protocol}127.0.0.1:3000/account/recharge`;
        const uri = `${config.protocol}${config.domain}/account/recharge`
        const response = yield axios.post(uri, {
          type: req.sdkEnv,
          address: sourceAddress
        })

        const balanceData = response.data

        if (balanceData.errorCode === 0) {
          return res.send({
            errorCode: -1,
            errorDesc: 'recharge success'
          })
        }

        return res.send(balanceData)
      }

      const nonceInfo = yield req.sdk.account.getNonce(sourceAddress)

      if (nonceInfo.errorCode !== 0) {
        debug('get nonce error')
        debug(nonceInfo)
        return res.send(nonceInfo)
      }

      let nonce = nonceInfo.result.nonce
      nonce = new BigNumber(nonce).plus(1).toString(10)

      // 1.build operation
      const opt = {
        initBalance: '10000000',
        type: 0,
        payload: contractCode
      }

      if (typeof input !== 'undefined' && input !== '') {
        opt.initInput = input
      }

      const contractCreateOperation = req.sdk.operation.contractCreateOperation(opt)

      if (contractCreateOperation.errorCode !== 0) {
        debug('contractCreateOperation error')
        debug(contractCreateOperation)
        return res.send(contractCreateOperation)
      }

      const operationItem = contractCreateOperation.result.operation

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

      return res.send(blobInfo)
    } catch (err) {
      debug(err)
    }
  }).catch(function (err) {
    debug(err)
  })
})

router.post('/invokeByBu', function (req, res, next) {
  co(function * () {
    try {
      const contractAddress = req.body.contractAddress
      const sourceAddress = req.body.sourceAddress
      const buAmount = req.body.buAmount
      const input = req.body.input

      if (!contractAddress || !sourceAddress) {
        return
      }
      const nonceInfo = yield req.sdk.account.getNonce(sourceAddress)

      if (nonceInfo.errorCode !== 0) {
        debug('get nonce error')
        debug(nonceInfo)
        return res.send(nonceInfo)
      }

      let nonce = nonceInfo.result.nonce
      nonce = new BigNumber(nonce).plus(1).toString(10)

      let opt = {
        contractAddress,
        sourceAddress
        // buAmount,
      }

      if (buAmount && buAmount !== '0') {
        opt.buAmount = buAmount
      }

      if (input) {
        opt.input = input
      }

      let contractInvokeByBUOperation = yield req.sdk.operation.contractInvokeByBUOperation(opt)

      if (contractInvokeByBUOperation.errorCode !== 0) {
        console.log(contractInvokeByBUOperation)
        return res.send(contractInvokeByBUOperation)
      }

      const operationItem = contractInvokeByBUOperation.result.operation

      const args = {
        sourceAddress,
        nonce,
        operations: [operationItem],
        signtureNumber: '100'
      }

      let feeData = yield req.sdk.transaction.evaluateFee(args)
      if (feeData.errorCode !== 0) {
        console.log(feeData)
        return res.send(feeData)
      }

      let feeLimit = feeData.result.feeLimit
      let gasPrice = feeData.result.gasPrice

      // 2. build blob
      let blobInfo = req.sdk.transaction.buildBlob({
        sourceAddress: sourceAddress,
        gasPrice,
        feeLimit,
        nonce: nonce,
        operations: [ operationItem ]
      })

      return res.send(blobInfo)
    } catch (err) {
      debug(err)
    }
  }).catch(function (err) {
    debug(err)
  })
})

module.exports = router
