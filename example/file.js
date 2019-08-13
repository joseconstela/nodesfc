/**
 * @dependency lodash latest
 */
require('lodash').map([1,2,3,4], n => console.log(n))

console.log(`Environment variable "CHARACTER": ${process.env.CHARACTER || 'Not set'}`)

/**
 * @dependency faker latest
 */
let fake = require('faker').fake('{{name.lastName}}, {{name.firstName}}')
console.log(fake)