const fs = require("fs")
const {pipeline} = require("stream/promises")

async function readWithProgress(filepath) {
    const readStream = fs.createReadStream(filepath)
    let bytes = 0;

    readStream.on("data",(chunk)=>{
        bytes+=chunk.length;
        console.log(`Read: ${(bytes/1024).toFixed(2)} KB`)
    })
    await pipeline(readStream,process.stdout);
}

readWithProgress("./read.txt")