'use strict'

const chai = require('chai')
const axios = require('axios')
const config = require('../config')
chai.should()

describe('Test account recharge', function () {
  it('Test account recharge', async () => {
    const response = await axios.post(`http://localhost:${config.port}/account/recharge`, {
      address: 'buQr3aSDMLFbcNghgEp5LyHJVLJzkwZmm3bz'
    })
    response.data.errorCode.should.equal(-1)
    response.data.errorDesc.should.equal('Current balance is enough')
  })
})
