/*
markdown => zone-file as json

**input**
```md
## Origin: tableflip.io

name      | type | data
----------|------|---------------
@         | A    | 178.62.82.182
www       | A    | @
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
  zones.push({origin: origin})
},
parser.table = function (text, node, zones) {
  // console.log('table' , node)
}

module.exports = function (str, cb) {
  var ast = marked.parse(str)
  var zones = ast.reduce(function (zones, node) {
    var res = parser(node, zones)
    if (!res) return zones
  }, [])
  cb(null, zones)
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
