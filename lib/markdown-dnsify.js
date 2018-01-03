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
var stringify = require('json-stable-stringify')

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
  var rows = node.body.map(tr => {
    return tr.content.map(td => {
      return td.content
        // Allow for objects like:
        // {type: 'codespan', text: 'v=spf1 include:mailgun.org ~all'}
        // as well as plain old strings.
        .map(c => c.text ? c.text : c)
        // Join them together because strings sometimes
        // get split apart if they have special chars in them. e.g.
        // smtp.\_domainkey.foo ---> [ 'smtp.', '_', 'domainkey.foo' ]
        .join('')
    })
  })
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
    .map(orderProperties)
  cb(null, zones)
}

// zone obj transforms
function fillInTheBlanks (zone) {
  var originA = zone.records.filter(r => {
    return clean(r.type) === 'a' && ([undefined, '', '@'].some(v => r.name === v))
  })
  zone.records.forEach(function (r) {
    if (!r.name) r.name = '@'
    if (!r.data || clean(r.data) === '@') r.data = originA[0].data
  })
  return zone
}

function expandZone (zone) {
  var records = flatmap(zone.records, expandRecord)
  return merge(zone, {records: records})
}

function orderProperties (zone) {
  var order = ['name', 'ttl', 'class', 'type', 'data']
  return JSON.parse(stringify(zone, { cmp (a,b) {
    return order.indexOf(a.key) > order.indexOf(b.key) ? 1 : -1
  }}))
}

function expandRecord (record) {
  // no expandos in txts plz.
  if (clean(record.type) === 'txt') { return [record] }
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
  return res
}

function expandList (str) {
  return str.split(' ').filter(str => str !== '')
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
