let os = require('os')
let path = require('path')

let fs = require('fs')
let nodesfc = require('../')

let randomString = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
let file = {
  name: `${os.tmpdir()}${path.sep}${randomString()}`
}

let inputCode = `
/**
 * @dependency lodash latest
 */
require('lodash').map([1,2,3,4], n => console.log(n))

/**
 * @dependency faker latest
 */
let fake = require('faker').fake('{{name.lastName}}, {{name.firstName}}')
console.log(fake)`

fs.writeFileSync(file.name, inputCode)

nodesfc
  .init({file: file.name})
  .then(result => {
    console.log({result})
  })