'use strict'

const chai = require('chai')
const axios = require('axios')
const config = require('../config')
chai.should()

describe('Test case list', function () {
  it('Test case list', async () => {
    const response = await axios.get(`http://localhost:${config.port}/case/list`)
    response.data.result.should.be.a('array')
  })
})
