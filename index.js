#!/usr/bin/env node

// Require NPM dependencies
const npm = require('npm'),
  fs = require('fs-extra'),
  parser = require('comment-parser'),
  debug = require('debug')('nodesfc'),
  colors = require('colors'),
  path = require('path'),
  program = require('commander'),
  pkg = require('./package.json'),
  chokidar = require('chokidar')

// Require local dependencies
const script = require('./script')

// cli parameter parsing and --help symlink
program
  .version(pkg.version)
  .arguments('<file>')
  .option('-d, --dryrun', 'Removes node_modules and package-lock.json before installing dependencies.')
  .option('-w, --watch', 'Watch for changes in the file')
  .option('--noupdate', 'Opt-out of update version check')

// must be before .parse() since
// node's emit() is immediate
program.on('--help', () => {
  console.log('')
  console.log('Example:')
  console.log('  $ nodesfc --watch example/file.js')
  console.log('')
  console.log('Specifying dependencies:')
  console.log('  /**')
  console.log('   * @dependency lodash latest')
  console.log('   */')
})

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp(colors.red)
  return
}

if (!program.noupdate) {
  // Checks for available updates
  require('update-notifier')({
    pkg,
    updateCheckInterval: 1000 * 60 * 60 * 24 * 2
  }).notify({defer: false})
}

program.file = program.args[0]

// Only execute if the target file exists
if (!fs.existsSync(program.file)) {
  console.error('File not found.'.red)
  program.outputHelp(colors.red)
  process.exit(1)
  return
}

// Initialize path-related variables
const targetPath = path.dirname(program.file)

const run = () => {
  const contents = fs.readFileSync(program.file, 'utf-8')
  const packageExists = fs.existsSync(`${targetPath}/package.json`)

  // If there's an existing package.json file for the specified file,
  // skip the dependencies installation and execute the script.
  if (packageExists) {
    debug('A package.json file already exists.'.yellow)
    debug('Skipping dependencies installation.'.yellow)
    script.execute([program.file], program, targetPath)
    return
  }

  // Parse the comments for the targeted file
  const comments = parser(contents)

  // Hold a list of dependencies, as in:
  // [ "package@version" ]
  let dependencies = []

  // Find the comment that contains the dependencies
  const dependenciesComments = comments.filter(comment => {
    return (comment.tags||[]).find(t => t.tag === 'dependency')
  })

  // If there's no dependencies comment, execute the script normally.
  if (!dependenciesComments) {
    debug('No dependencies comment found. Executing script.'.yellow)
    script.execute([program.file], program, targetPath)
    return
  }

  // For all the js-doc tags found in the dependencies comment, grab and parse
  // only the ones that contain actual requirements.
  dependenciesComments.map(dc => {
    dc.tags.map(tag => {
      if (tag.tag !== 'dependency') return;
      dependencies.push(`${tag.name}@${tag.description}`)
    })
  })

  // If there are no dependencies found on the comment, execute the script
  // normally
  if (!dependencies.length) {
    debug('No dependencies comment found. Executing script.'.yellow)
    script.execute([program.file], program, targetPath)
    return
  }

  if (program.dryrun) {
    // Remove the node_modules folder to ensure a clean-execution
    debug('Performing dryrun'.yellow)
    fs.removeSync(`${targetPath}/node_modules`)
    fs.removeSync(`${targetPath}/package-lock.json`)
  }

  // Initi npm package
  npm.load({
    prefix: targetPath
  }, () => {
    // Install the dependencies
    script
      .executeNpm(['install', '--silent', '--no-audit', '--no-progress'].concat(dependencies), targetPath)
      .then(() => {
        script.execute([program.file], program, targetPath)
          .then(() => {
            if (program.watch) {
              console.log('Clean exit - waiting for file changes to restart'.green)
            }
          })
          .catch(ex => {
            if (program.watch) {
              console.log('Error - waiting for file changes to restart'.red)
            }
          })
      })
  })
}

if (program.watch) {
  chokidar.watch(program.file, {
    persistent: true
  })
  .on('change', path => {
    console.log('Changes detected - restarting'.yellow)
    run()
  })
}

run()