'use strict'

const chai = require('chai')
const axios = require('axios')
const config = require('../config')
chai.should()

describe('Test account getBalance', function () {
  it('Test account getBalance', async () => {
    let response = await axios.get(`http://localhost:${config.port}/account/getBalance`, {
      params: {
        type: 'development',
        address: 'buQr3aSDMLFbcNghgEp5LyHJVLJzkwZmm3bz'
      }
    })
    response.data.errorCode.should.equal(0)

    // address is empty
    response = await axios.get(`http://localhost:${config.port}/account/getBalance`, {
      params: {
        address: ''
      }
    })
    response.data.errorCode.should.equal(11006)

    response = await axios.get(`http://localhost:${config.port}/account/getBalance`, {
      params: {
        type: 'production',
        address: 'buQr3aSDMLFbcNghgEp5LyHJVLJzkwZmm3bz'
      }
    })
    // console.log(response.data);
    // response.data.errorCode.should.equal(15001);
  })
})
