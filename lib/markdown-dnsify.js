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

var marked = require('marked-ast')
var _s = require('underscore.string')

var parser = function (node, zones) {
  var fun = parser[node.type]
  if (!fun) return null
  fun(clean(node.text), node, zones)
}
parser.heading = function (text, node, zones) {
  var origin = extractOrigin(text)
  if (!origin) return
  zones.push({origin: origin, records:[]})
}
parser.table = function (text, node, zones) {
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

  // expand rows as needed
  records = records.reduce((records, r) => {
    // no expandos in txts plz.
    if (clean(r.type) === 'txt') {
      // Unwrap txt data if needed. No cleaning is done. It's your txt record.
      if (r.data && r.data.text) r.data = r.data.text
      records.push(r)
      return records
    }
    // { name: '@ www' } => [{name: '@'}, {name: 'www'}]
    return records.concat(expand(r, ' '))
  }, [])

  zone.records = zone.records.concat(records)
}

// { name: '@ www', type: 'A' } => [{name: '@', type: 'A'}, {name: 'www', type: 'A'}]
function expand (obj, re) {
  var res = Object.keys(obj).reduce((res, key, index) => {
    var values = obj[key].split(re).filter(str => str !== '')
    if (values.length === 1) return res
    return res.concat(values.map(v => {
      var record = JSON.parse(JSON.stringify(obj))
      record[key] = v
      return record
    }))
  }, [])
  if (res.length === 0) res.push(obj)
  return res
}

function extractOrigin (str) {
  var prefix = 'origin:'
  if (! _s.startsWith(str, prefix) ) return
  var origin = _s.ltrim(str, prefix)
  return _s.trim(origin)
}

function clean (raw) {
  return _s.trim(raw).toLowerCase()
}

module.exports = function (str, cb) {
  var ast = marked.parse(str)
  var zones = ast.reduce((zones, node) => {
    var res = parser(node, zones)
    if (!res) return zones
  }, [])
  cb(null, zones)
}
