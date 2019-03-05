# Single File Code

> Single File Code, or sfc, allows to execute nodejs scripts with its dependencies
defined in the script itself.

---

<div align="center">
	<p>
    <sup>Support my work,</sup>
		<br>
		<a href="https://www.patreon.com/joseconstela">
			<img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" width="160">
		</a>
  </p>
</div>

Instead of having a package.json file and installing the dependencies via npm
commands, you can specify the dependencies in your script comments.

SFC will take care of installing the dependencies.

```javascript
/**
 * @dependency lodash latest
 */
require('lodash').map([1,2,3,4], n => console.log(n))

/**
 * @dependency faker latest
 */
let fake = require('faker').fake('{{name.lastName}}, {{name.firstName}}')
console.log(fake)
```

It supports nodemon.io for your development-phase things.

## Installation

Use your terminal to install sfc as a globally availabe package.

```bash
npm i nodesfc -g
```

## Usage

```bash
Usage: nodesfc [options] <file>

Options:
  -V, --version   output the version number
  -dr, --dryrun   Removes node_modules and package-lock.json before installing dependencies.
  -nd, --nodemon  Executes the file continiously. Requires https://nodemon.io/
  -h, --help      output usage information

Example:
  $ nodesfc example/file.js --nodemon

Specifying dependencies:
  /**
   * @dependency lodash latest
   */
```

To get help, execute:

```bash
nodesfc -h
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
