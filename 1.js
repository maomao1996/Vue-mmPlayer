const fs = require('fs')

fs.writeFileSync('./dist/config.json', JSON.stringify({
  ver: Date.now()
}))
fs.writeFileSync('./dist/cloud-music.js', '')