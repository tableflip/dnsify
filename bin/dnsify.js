#!/usr/bin/env node
var fs = require('fs');
var parser = require('../lib/markdown-dnsify')
var zonefile = require('../lib/dnsify-zonefile')
var argv = require('yargs')
    .usage('Usage: $0 [options] file')
    .demand(1)
    .example('$0 example.org.md', '[Convert markdown dns to a zonefile]')
    .alias('j', 'json')
    .help('h')
    .alias('h', 'help')
    .argv

var file = argv._[0]
var s = fs.readFile(file, 'utf8', function (err, md) {
  if (err) exitOnError(err)
  parser(md, function (err, zones) {
    if (err) exitOnError(err)
    if (argv.json) return console.log(JSON.stringify(zones, null, 2))
    zonefile(zones, function (err, data) {
      if (err) exitOnError(err)
      console.log(data)
    })
  })
})

function exitOnError (err) {
  console.error(err)
  process.exit(-1)
}