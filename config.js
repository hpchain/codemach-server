'use strict'

module.exports = {
  port: '3000',
  protocol: 'http://',
  host: {
    production: 'seed1.bumo.io:16002',
    development: 'seed1.bumotest.io:26002',
    sandbox: '127.0.0.1:36002'
  },
  // Nginx proxy domain
  domain: '127.0.0.1:3002',

  // privatekey for sandbox env
  // privateKey: 'privbzqBymaoQFspMZd92TeEzRSeeEJBSojXZeUP3RtXAKUbWBLGb1SQ',
  privateKey: 'privC17CRRAjNvELrfbTFbLJstyGxk3unpPkRZCZoXRz13WEpN5SiHn8'
}
