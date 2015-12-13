# DNS Config that doesn't repeat itself quite so much

## Origin: tableflip.io

data           | type | name
-------------- |------|--------------
178.62.82.182  | A    | @ www blog hook next
212.110.189.58 | A    | old

type | data
-----|------
MX   | mx-{1,2}.rightbox.com:10 mx-3.rightbox.com:20
TXT  | `v=spf1 include:_spf.google.com include:_spf.freeagent.com ~all`

