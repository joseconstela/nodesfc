#!/usr/bin/env node

// Require NPM dependencies
const npm = require('npm'),
  fs = require('fs-extra'),
  parser = require('comment-parser'),
  colors = require('colors'),
  path = require('path'),
  commandExists = require('command-exists').sync,
  program = require('commander')

// Require local dependencies
const script = require('./script')

// cli parameter parsing and --help symlink
program
  .version(require('./package.json').version)
  .arguments('<file>')
  .option('-dr, --dryrun', 'Removes node_modules and package-lock.json before installing dependencies.')
  .option('-nd, --nodemon', 'Executes the file continiously. Requires https://nodemon.io/')

// must be before .parse() since
// node's emit() is immediate
program.on('--help', () => {
  console.log('')
  console.log('Example:')
  console.log('  $ nodesfc example/file.js --nodemon')
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

program.file = program.args[0]

// Only execute if the target file exists
if (!fs.existsSync(program.file)) {
  console.log('File not found.'.red)
  console.log('')
  program.outputHelp(colors.red)
  process.exit(1)
  return
}

// Make sure nodemon is available if the program requires it.
if (program.nodemon) {
  if (!commandExists('nodemon')) {
    throw new Error('nodemon binary not found')
  }
}

// Initialize path-related variables
const targetPath = path.dirname(program.file)
const contents = fs.readFileSync(program.file, 'utf-8')
const packageExists = fs.existsSync(`${targetPath}/package.json`)

// If there's an existing package.json file for the specified file,
// skip the dependencies installation and execute the script.
if (packageExists) {
  console.log('A package.json file already exists.'.yellow)
  console.log('Skipping dependencies installation.'.yellow)
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
  console.log('No dependencies comment found. Executing script.'.yellow)
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
  console.log('No dependencies comment found. Executing script.'.yellow)
}

if (program.dryrun) {
  // Remove the node_modules folder to ensure a clean-execution
  console.log('Performing dryrun'.yellow)
  fs.removeSync(`${targetPath}/node_modules`)
  fs.removeSync(`${targetPath}/package-lock.json`)
}

// Initi npm package
npm.load({ prefix: targetPath }, () => {
  npm.config.set('dir', targetPath)
  // Install the dependencies
  npm.commands.install(dependencies, function (er, data) {
    // Execute the script
    script.execute([program.file], program, targetPath)
  })
})
