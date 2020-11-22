;
(async () => {
  let lib = require('..')

  let r = await lib.init({
    method: 'handler',
    methodArgs: ["hello", "world"],
    file: './export-handler.js'
  })

  console.log(r)
})()