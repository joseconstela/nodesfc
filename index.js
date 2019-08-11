process.env.DEBUG='nodesfc'

const npm = require('npm'),
  fs = require('fs-extra'),
  parser = require('comment-parser'),
  debug = require('debug')('nodesfc'),
  path = require('path'),
  chokidar = require('chokidar')
  
// Require local dependencies
const script = require('./script')

/**
 * Initialize!
 * 
 * @param {Object} program Commander's original object
 */
const init = async (program) => {
  debug(`Init. Program file: ${program.file}`)

  // Only execute if the target file exists
  if (!fs.existsSync(program.file)) {
    throw new Error('file-not-found')
  }

  debug('File found')

  // Initialize path-related variables
  const targetPath = path.dirname(program.file)

  debug(`Target path: ${targetPath}`)

  const run = () => {
    const contents = fs.readFileSync(program.file, 'utf-8')
    const packageExists = fs.existsSync(`${targetPath}/package.json`)

    debug(`Package file exists: ${packageExists}`)

    // If there's an existing package.json file for the specified file,
    // skip the dependencies installation and execute the script.
    if (packageExists) {
      debug('A package.json file already exists.')
      debug('Skipping dependencies installation.')
      return script.execute([program.file], program, targetPath)
    }

    debug(`Parse comments...`)

    // Parse the comments for the targeted file
    const comments = parser(contents)

    // Hold a list of dependencies, as in:
    // [ "package@version" ]
    let dependencies = []

    // Find the comment that contains the dependencies
    const dependenciesComments = comments.filter(comment => {
      return (comment.tags || []).find(t => t.tag === 'dependency')
    })

    // If there's no dependencies comment, execute the script normally.
    if (!dependenciesComments) {
      debug('No dependencies comment found. Executing script.')
      return script.execute([program.file], program, targetPath)
    }

    // For all the js-doc tags found in the dependencies comment, grab and parse
    // only the ones that contain actual requirements.
    dependenciesComments.map(dc => {
      dc.tags.map(tag => {
        if (tag.tag !== 'dependency') return;
        debug(`Adding dependency ${tag.name}@${tag.description}`)
        dependencies.push(`${tag.name}@${tag.description}`)
      })
    })

    // If there are no dependencies found on the comment, execute the script
    // normally
    if (!dependencies.length) {
      debug('No dependencies comment found. Executing script.')
      return script.execute([program.file], program, targetPath)
    }

    if (program.dryrun) {
      // Remove the node_modules folder to ensure a clean-execution
      debug('Performing dryrun')
      fs.removeSync(`${targetPath}/node_modules`)
      fs.removeSync(`${targetPath}/package-lock.json`)
    }

    debug('Init main promise')

    return new Promise((resolve, reject) => {
      debug('Created main promise')
      // Init npm package
      npm.load({
        prefix: targetPath
      }, () => {
        debug('npm loaded')
        // Install the dependencies
        script
          .executeNpm(['install', '--silent', '--no-audit', '--no-progress'].concat(dependencies), targetPath)
          .then(() => {
            debug('Dependencies installed. Running now')
            return script.execute([program.file], program, targetPath)
              .then(result => {
                if (program.watch) {
                  console.log('Clean exit - waiting for file changes to restart')
                }
                resolve(result)
              })
              .catch(ex => {
                debug('Script execution error')
                if (program.watch) {
                  console.log('Error - waiting for file changes to restart')
                }
              })
          })
          .catch(ex => {
            debug('NPM error')
            debug(ex)
          })
      })
    })
   
  }

  if (program.watch) {
    debug('Watching for changes')
    chokidar.watch(program.file, {
        persistent: true
      })
      .on('change', path => {
        console.log('Changes detected - restarting')
        run()
      })
  }
  debug('nodemon-like integration disabled')

  return run()
}

module.exports.init = init