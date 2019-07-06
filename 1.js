const fs = require('fs')

let today = new Date()

fs.writeFileSync('./dist/config.json', JSON.stringify({
  ver: `${today.toLocaleString()}`
}))
fs.writeFileSync('./dist/cloud-music.js', '')