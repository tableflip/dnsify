var zonefile = require('dns-zonefile')

module.exports = function (obj) {
  return obj.map(origin => {
    var zfOptions = {
      $origin: origin.origin,
      $ttl: origin.ttl,
      soa: {}
    }

    origin.records.forEach(r => {
      var type = r.type.toLowerCase()
      zfOptions[type] = zfOptions[type] || []
      if (!TypeMappers[type]) throw new Error('Unsupported record type "' + r.type + '"')
      zfOptions[type].push(TypeMappers[type](r))
    })

    return zonefile.generate(zfOptions)
  }).join('\n\n')
}

var TypeMappers = {
  a: r => ({ name: r.name, ip: r.data }),
  txt: r => ({ name: r.name, txt: r.data }),
  cname: r => ({ name: r.name, alias: r.data }),
  mx: r => ({
    name: r.name,
    preference: parseInt(r.data.split(':')[1]),
    host: r.data.split(':')[0]
  }),
}
