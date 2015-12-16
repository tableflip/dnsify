/*
markdown => zone-file as json

**input**
```md
## Origin: tableflip.io

name      | type | data
----------|------|---------------
@ www     | A    | 178.62.82.182
```

**output**

```js
[{
  "origin": "tableflip.io",
  "records" : [
    {
      "type": "A",
      "name": "@",
      "data": "178.62.82.182"
    },
    {
      "type": "A",
      "name": "www",
      "data": "178.62.82.182"
    }
  ]
}]
```
*/

var extend = require('extend')
var flatmap = require('flatmap')
var marked = require('marked-ast')
var _s = require('underscore.string')
var expandBraces = require('brace-expansion')

// Pick out intersting nodes. `zones` is a mutable accumulator for what we find
var parser = function (zones, node) {
  var fun = parser[node.type]
  if (fun) fun(zones, node)
  return zones
}
parser.heading = function (zones, node) {
  var origin = extractOrigin(node.text)
  if (origin) zones.push({origin: origin, records:[]})
}
parser.table = function (zones, node) {
  var zone = zones[zones.length - 1]
  // ['data', type, 'name']
  var headers = node.header[0].content.map(node => clean(node.content))
  // [['192.168.0.1', 'A', '@ www'] ...]
  var rows = node.body.map(tr => tr.content.map(td => td.content[0]))
  // { data: '192.168.0.1', type: 'A', name: '@ www' }
  var records = rows.map((row) => {
    return row.reduce((record, cell, cellIndex) => {
      // 'data'
      var prop = headers[cellIndex]
      // { data: '192.168.0.1' }
      record[prop] = cell
      return record
    }, {})
  })
  zone.records = zone.records.concat(records)
}

module.exports = function (str, cb) {
  var ast = marked.parse(str)
  var zones = ast
    .reduce(parser, [])
    .map(expandZone)
    .map(fillInTheBlanks)
  cb(null, zones)
}

// zone obj transforms
function fillInTheBlanks (zone) {
  var originA = zone.records.filter(function (r) {
    return clean(r.type) === 'a' && (!r.name || clean(r.name) === '' || clean(r.name) === 'a')
  })
  // TODO: error on missing
  zone.records.forEach(function (r) {
    if (!r.name) r.name = '@'
    if (!r.data || clean(r.data) === '@') r.data = originA.data
  })
  return zone
}

function expandZone (zone) {
  var records = flatmap(zone.records, expandRecord)
  // console.log('records', records)
  return merge(zone, {records: records})
}

function expandRecord (record) {
  // no expandos in txts plz.
  if (clean(record.type) === 'txt') { return [cleanTxtRecord (record)] }
  var res = Object.keys(record).reduce((res, key) => {
    // Expand all the things
    var expandos = [expandList, expandBraces]
    // flapmap the expandos! 1 value becomes an array of values, which must be fed into the next expando.
    var values = expandos.reduce((values, fn) => {
      return flatmap(values, fn)
    }, [record[key]])
    // Skip if nothing got expanded
    if (values.length === 1) return res
    // Create new records as requrired
    return res.concat(values.map(val => {
      var r = extend({}, record)
      r[key] = val
      return r
    }))
  }, [])
  // Nothing expanded? Return the original
  if (res.length === 0) res.push(record)
  // console.log('res', res, record)
  return res
}

function expandList (str) {
  return str.split(' ').filter(str => str !== '')
}

function cleanTxtRecord (record) {
  if (record.data && record.data.text) {
    record.data = record.data.text
  }
  return record
}

function extractOrigin (str) {
  str = clean(str)
  var prefix = 'origin:'
  if (! _s.startsWith(str, prefix) ) return
  var origin = _s.ltrim(str, prefix)
  return _s.trim(origin)
}

function clean (raw) {
  return _s.trim(raw).toLowerCase()
}

function merge (obj, props) {
  return extend({}, obj, props)
}
