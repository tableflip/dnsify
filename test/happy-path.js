var test = require('tape')
var fs = require('fs')

test('dry style', function (t) {
  var parser = require('../lib/markdown-dnsify.js')
  fs.readFile(__dirname + '/../examples/dry-style.dns.md', 'utf8', function (err, data) {
    parser(data, function (err, zones) {
      var zone = zones[0]
      t.error(err, 'No errors')
      t.equals(zone.origin, 'tableflip.io', 'Find origin')
      t.equals(zone.records.length, 10, 'Expands records')
      t.deepEquals(zones, require('../examples/dry-style.dns.json'), 'Matches expected output')
      t.end()
    })
  })
})

test('zone file style', function (t) {
  var parser = require('../lib/markdown-dnsify.js')
  fs.readFile(__dirname + '/../examples/zone-file-style.dns.md', 'utf8', function (err, data) {
    parser(data, function (err, zones) {
      var zone = zones[0]
      t.error(err, 'No errors')
      t.equals(zone.origin, 'tableflip.io', 'Find origin')
      t.equals(zone.records.length, 10, 'Expands records')
      t.deepEquals(zones, require('../examples/zone-file-style.dns.json'), 'Matches expected output')
      t.end()
    })
  })
})
