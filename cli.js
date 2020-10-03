#!/usr/bin/env node

// Require NPM dependencies
const program = require('commander'),
  pkg = require('./package.json')

// cli parameter parsing and --help symlink
program
  .version(pkg.version)
  .arguments('<file>')
  .option('-d, --dryrun', 'Removes node_modules and package-lock.json before installing dependencies.')
  .option('--debug', 'Enables debug messages.')
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
  program.outputHelp()
  return
}

if (!program.noupdate) {
  // Checks for available updates
  require('update-notifier')({
    pkg,
    updateCheckInterval: 1000 * 60 * 60 * 24 * 2
  }).notify({defer: false})
}

require('.').init(
  Object.assign({}, program, {file: program.args[0], cli: true})
)