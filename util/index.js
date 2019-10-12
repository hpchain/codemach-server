'use strict'

const encryption = require('hpchain-encryption')
const { promisify } = require('util')
const fs = require('fs')
const readdirAsync = promisify(fs.readdir)
const readFileAsync = promisify(fs.readFile)
const path = require('path')
const md5File = require('md5-file/promise')

const proto = module.exports

/**
 * Get address from private key
 * @param  {String} privateKey [private key]
 * @return {String}            [address]
 */
proto.getAddressFromPrivateKey = privateKey => {
  const KeyPair = encryption.keypair
  const publicKey = KeyPair.getEncPublicKey(privateKey)
  return KeyPair.getAddress(publicKey)
}

/**
 * Get file info from dir
 * @param  {String} dir [directory]
 * @return {Object}     [file info, include title, content, hash]
 */
proto.getFilesFromDir = async dir => {
  const list = []
  const files = await readdirAsync(dir)
  await Promise.all(files.map(async file => {
    const filePath = path.join(dir, file)
    const fileContent = await readFileAsync(filePath, 'utf8')
    const fileHash = await md5File(filePath)
    list.push({
      title: path.parse(filePath).name,
      content: fileContent,
      hash: fileHash
    })
  }))
  return list
}
