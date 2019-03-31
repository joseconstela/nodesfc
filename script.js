const cp = require('child_process')
const debug = require('debug')('nodesfc')

/**
 * Executes a node script and handles the stds
 * 
 * @param {Array} args 
 * @param {Object} program 
 * @param {String} targetPath 
 */
let execute = (args, program, targetPath) => {
  return new Promise((resolve, reject) => {
    let child = cp.spawn('node', args)

    child.stdout.on('data', data =>
      console.log(data.toString().replace(new RegExp(/\n$/), ''))
    )

    child.stderr.on('data', data => {
      console.error(data.toString().replace(new RegExp(/\n$/), ''))
    })

    child.on('close', code => {
      code > 0 ? reject(code) : resolve()
      debug
    }
    )
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
    let child = cp.spawn('npm', args, { stdio: null, cwd })
    child.on('close', code =>
      code > 0 ? reject(code) : resolve()
    )
  })
}

module.exports.executeNpm = executeNpm