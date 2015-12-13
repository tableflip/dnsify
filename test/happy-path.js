var test = require('tape')
var fs = require('fs')

test('find a table', function (t) {
  var parser = require('../lib/markdown-dnsify.js')
  fs.readFile(__dirname + '/../examples/dry-style.dns.md', 'utf8', function (err, data) {
    parser(data, function (err, zones) {
      t.error(err)
      t.equals(zones[0].origin, 'tableflip.io', 'Find origins')
      t.end()
    })
  })
})