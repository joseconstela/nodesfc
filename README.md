# Single File Code

Single File Code, or sfc, allows to execute nodejs scripts with its dependencies
defined in the script itself.

This means that instead of having a package.json file and installing the
dependencies via npm commands, you can specify the dependencies in a comment
in your script.

```javascript
/**
 * sfc.dependencies
 * @dependency lodash latest
 */
require('lodash').map([1,2,3,4], n => console.log(n))
```

It supports nodemon.io for your development-phase things.

## Installation

Use your terminal to install sfc as a globally availabe package.

```bash
npm i node-sfc -g
```

## Usage

```bash
Usage: node-sfc [options]

Options:
  -V, --version      output the version number
  -f, --file [file]  File to execute
  -nd, --nodemon     Executes the file continiously. Requires https://nodemon.io/
  -h, --help         output usage information

Example:
  $ node-sfc --file=example/file.js --nodemon

Specifying dependencies:
  /**
   * sfc.dependencies
   * @dependency package-name version
   */
```

To get help, execute:

```bash
node-sfc -h
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)