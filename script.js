const cp = require('child_process')

/**
 * Executes a node script, either using nodemon or node executable.
 * 
 * @param {Array} args 
 * @param {Object} program 
 * @param {String} targetPath 
 */
let execute = (args, program, targetPath) => {
  return new Promise((resolve, reject) => {
    if (program.nodemon) {
      args.push('--watch')
      args.push(targetPath)
    }
    let child = cp.spawn(program.nodemon ? 'nodemon' : 'node', args)
    let err = null
    child.stdout.on('data', data =>
      console.log(data.toString().replace('\n', ''))
    )
    child.stderr.on('data', data =>
      err = data.toString()
    )
    child.on('close', code =>
      code > 0 ? reject(code) : resolve()
    )
  })
}

module.exports.execute = execute