# Single File Code

> Single File Code, or sfc, allows to execute nodejs scripts with its dependencies.
> defined in the script itself. _Either via cli or via module_

<div>
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

![example](https://raw.githubusercontent.com/joseconstela/nodesfc/f25cebc75a5e6fd34be767f54dbf2011bb08d947/nodesfc.gif)

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

It supports `--watch` for your development-phase things.

## Installation

Use your terminal to install sfc as a globally availabe package.

```bash
npm i nodesfc -g
```

## Cli usage

```bash
Usage: nodesfc [options] <file>

Options:
  -V, --version   output the version number
  -dr, --dryrun   Removes node_modules and package-lock.json before installing dependencies.
  -w, --watch     Watch for changes in the file
  -h, --help      output usage information

Example:
  $ nodesfc --watch example/file.js

Specifying dependencies:
  /**
   * @dependency lodash latest
   */
```

To get help, execute:

```bash
nodesfc -h
```

## Library usage

```javascript
require('nodesfc')
  .init({file: 'my_javascript_file.js'})
  .then(result => console.log({result}))

/*
  {
    "stdLines": [
      {
        "output": "1",
        "err": false,
        "date": "2019-08-14T11:47:21.821Z"
      },
      {
        "output": "2",
        "err": false,
        "date": "2019-08-14T11:47:21.821Z"
      },
      {
        "output": "3",
        "err": false,
        "date": "2019-08-14T11:47:21.821Z"
      },
      {
        "output": "4",
        "err": false,
        "date": "2019-08-14T11:47:21.821Z"
      },
      {
        "output": "Boyle, Alek",
        "err": false,
        "date": "2019-08-14T11:47:23.063Z"
      }
    ],
    "code": 0
  }
*/
```

The `init` method returns a Promise with an object with the properties:

- `stdLines` being an array of objects containing the STD outputs for both
errors and logs. In the same order as they were triggered. 
  - `output` string - the actual text logged
  - `err` boolean - determines if the log was sent to std-err or not
- `code` number - the execution exit code.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
