require('../')
  .init({file: 'file.js'})
  .then(result => console.log(JSON.stringify(result, ' ', 2)))