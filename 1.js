const fs = require('fs')

let today = new Date()

fs.writeFileSync('./dist/config.json', JSON.stringify({
  ver: `${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}.${today.getHours()}.${today.getMinutes()}`
}))
fs.writeFileSync('./dist/cloud-music.js', '')