'use strict'

module.exports = {
  port: '3000',
  protocol: 'http://',
  host: {
    // the host of production environment
    production: 'seed1.bumo.io:16002',
    // the host of sandbox environment
    development: 'seed1.bumotest.io:26002',
    // the host of sandbox environment
    sandbox: '127.0.0.1:36002'
  },
  // Nginx proxy domain or host
  domain: '127.0.0.1:3002',

  // privatekey for sandbox environment
  privateKey: 'privC17CRRAjNvELrfbTFbLJstyGxk3unpPkRZCZoXRz13WEpN5SiHn8'
}
