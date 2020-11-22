const path = require('path')
const cp = require('child_process')
const debug = m => {
  console.log(JSON.stringify(m))
}

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
let execute = async (program, targetPath) => {
  return new Promise(async (resolve, reject) => {
    // Set environment variables
    Object.keys(program.env || {}).map(k => {
      process.env[k] = program.env[k]
    })

    if (program.method) {
      try {
        let lib = require(program.file)
        resolve(lib[program.method].apply(null, program.methodArgs || []))
      }
      catch (ex) {
        reject(ex)
      }
      finally {
        delete require.cache[program.file]
      }
      return
    }

    let child = cp.spawn('node', [program.file])

    let stdLines = []

    child.stdout.on('data', data => {
      const date = new Date()
      const lines = data.toString().replace(new RegExp(/\n$/, 'g'), '').split('\n')
      lines.map(r => {
        stdLines.push({ output: r, err: false, date })
        if (program.cli) {
          console.log(r)
        }
      })
    })

    child.stderr.on('data', data => {
      const date = new Date()
      const lines = data.toString().replace(new RegExp(/\n$/, 'g'), '').split('\n')
      if (!program.cli) lines.map(r => {
        stdLines.push({
          output: r, err: true, date
        })
      })
      else console.error(data.toString())
    })

    child.on('close', code => {
      code > 0 ? reject({stdLines, code}) : resolve({stdLines, code})
      if (program.debug) debug({stdLines, code})
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