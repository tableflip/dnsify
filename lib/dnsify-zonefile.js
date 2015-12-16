var fs = require('fs')
var handlebars = require('handlebars')
module.exports = function (obj, cb) {
  fs.readFile(__dirname + '/zonefile.hbs', 'utf8', function (err, data) {
    if (err) return cb(err)
    var tpl = handlebars.compile(data)
    cb(null, tpl(obj))
  })
}
