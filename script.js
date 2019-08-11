const cp = require('child_process')
const debug = require('debug')('nodesfc')

const buildStd = (std) => {
  std = std.replace(new RegExp(/\n$/), '')
  return std.trim() === '' ? null : std
}

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

    let std = {
      out: '',
      err: ''
    }

    child.stdout.on('data', data => {
      let r = data.toString().replace(new RegExp(/\n$/), '')
      if (!program.cli) std.out += `${r}\n`
      else console.log(r)
    })

    child.stderr.on('data', data => {
      let r = data.toString().replace(new RegExp(/\n$/), '')
      if (!program.cli) std.err += r
      else console.error(r)
    })

    child.on('close', code => {
      std.out = buildStd(std.out)
      std.err = buildStd(std.err)
      code > 0 ? reject({std, code}) : resolve({std, code})
      debug({std, code})
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