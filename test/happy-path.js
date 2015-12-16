var test = require('tape')
var fs = require('fs')

test('find a table', function (t) {
  var parser = require('../lib/markdown-dnsify.js')
  fs.readFile(__dirname + '/../examples/dry-style.dns.md', 'utf8', function (err, data) {
    parser(data, function (err, zones) {
      var zone = zones[0]
      t.error(err)
      t.equals(zone.origin, 'tableflip.io', 'Find origins')
      t.equals(zone.records.length, 10, 'Expands records')
      t.end()
    })
  })
})