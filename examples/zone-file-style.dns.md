# DNS Config that looks a lot like a zone file

## Origin: tableflip.io

name      | type | data
----------|------|---------------
@         | A    | 178.62.82.182
www       | A    | @
blog      | A    | @
hook      | A    | @
next      | A    | @
old       | A    | 212.110.189.58
@         | MX   | mx-1.rightbox.com:10
@         | MX   | mx-2.rightbox.com:10
@         | MX   | mx-3.rightbox.com:20
@         | TXT  | `v=spf1 include:_spf.google.com include:_spf.freeagent.com ~all`

