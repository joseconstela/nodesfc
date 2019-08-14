require('../')
  .init({
    file: 'file.js',
    env: {
      CHARACTER: 'Jon Snow'
    }
  })
  .then(result => console.log(JSON.stringify(result, ' ', 2)))