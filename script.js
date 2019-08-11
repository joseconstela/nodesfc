const cp = require('child_process')
const debug = require('debug')('nodesfc')

/**
 * Executes a node script and handles the stds
 * 
 * @param {Array} args 
 * @param {Object} program 
 * @param {String} targetPath 
 */
let execute = async (args, program, targetPath) => {
  return new Promise((resolve, reject) => {
    let child = cp.spawn('node', args)

    let err = ''
    let result = ''

    child.stdout.on('data', data => {
      let r = data.toString().replace(new RegExp(/\n$/), '')
      if (!program.cli) result += `${r}\n`
      else console.log(r)
    })

    child.stderr.on('data', data => {
      let r = data.toString().replace(new RegExp(/\n$/), '')
      if (!program.cli) err += r
      else console.error(r)
    })

    child.on('close', code => {
      code > 0 ? reject(err || code) : resolve(result.replace(new RegExp(/\n$/), ''))
      debug
    })
  })
}

module.exports.execute = execute

/**
 * Executes a npm command
 * 
 * @param {Array} args 
 */
let executeNpm = (args, cwd) => {
  return new Promise((resolve, reject) => {
    let child = cp.spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', args, { stdio: null, cwd })
    child.on('close', code =>
      code > 0 ? reject(code) : resolve()
    )
  })
}

module.exports.executeNpm = executeNpm