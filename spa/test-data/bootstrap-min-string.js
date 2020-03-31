const fs = require('fs')

let bootstrapMin = ''

fs.readFile('./bootstrap-encoded', function(err, data){
    if(err){
        console.log("there is an error")
        return
    }
    let bufferData = Buffer.from(data.toString(), 'base64')
    bootstrapMin = bufferData.toString('ascii')
    console.log(bootstrapMin)
})