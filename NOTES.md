
RAW noodling with formats.

## markdown

### tableflip.io

type | data
-----|-----
A    | 178.62.71.236
AAAA | 2001:db8:10::1


name  | type  | data
------|-------|---------------
www   | A     | 178.62.71.236
beta  | A     | 178.62.71.100
next  | A     | 178.62.74.247
test  | CNAME | next


type  | data
------|-----
MX    | mx-{1,2}.rightbox.com:10 mx-3.rightbox.com:20
TXT   | `v=spf1 include:_spf.google.com include:_spf.freeagent.com ~all`


---

name      | type | data
----------|------|---------------
@ www     | A    | 178.62.82.182
blog      | A    | @
hook      | A    | @
next      | A    | @
blog.next | A    | @
old       | A    | 212.110.189.58
@         | MX   | mx-{1,2}.rightbox.com:10 mx-3.rightbox.com:20
@         | TXT  | `v=spf1 include:_spf.google.com include:_spf.freeagent.com ~all`

---

## zonefile

```zonefile
$ORIGIN kitmapper.com.     ; designates the start of this zone file in the namespace
example.com.  IN  MX    10 mail.example.com.  ; mail.example.com is the mailserver for example.com
@             IN  MX    20 mail2.example.com. ; equivalent to above line, "@" represents zone origin
@             IN  MX    50 mail3              ; equivalent to above line, but using a relative host name
example.com.  IN  A     192.0.2.1             ; IPv4 address for example.com
```

---

tableflip.io
```
    A @ next www 178.62.82.182
   MX mx-{1,2,3}.rightbox.com:10
  TXT "v=spf1 include:_spf.google.com include:_spf.freeagent.com ~all"
   NS {a,b,c}.ns.bytemark.co.uk
```



tableflip.io

  A | @ next www | 178.62.82.182
 MX | mx-{1,2,3}.rightbox.com:10
TXT | "v=spf1 include:_spf.google.com include:_spf.freeagent.com ~all"
 NS | {a,b,c}.ns.bytemark.co.uk


## toml

["kitmapper.com"]
ip = 178.62.82.182
a = ["@", www"]
mx = "mx-{1,2,3}.rightbox.com:10"
txt = "v=spf1 include:_spf.google.com include:_spf.freeagent.com ~all"

["next.kitmapper.com"]
ip = 178.62.82.182

["beta.kitmapper.com"]
ip = 178.62.82.182


- tableflip.io


## JSON

```js
{
  "type": "A",
  "name": "www",
  "data": "162.10.66.0",
}
```

## Tinydns

.tableflip.io::a.ns.bytemark.co.uk
.tableflip.io::b.ns.bytemark.co.uk
.tableflip.io::c.ns.bytemark.co.uk
+tableflip.io:178.62.82.182
+www.tableflip.io:178.62.82.182
+blog.tableflip.io:178.62.82.182
+hook.tableflip.io:178.62.82.182
+next.tableflip.io:178.62.82.182
+blog.next.tableflip.io:178.62.82.182
+old.tableflip.io:212.110.189.58

+studybundles.tableflip.io:178.62.29.91
+localnets.tableflip.io:178.62.59.176

# pobox email
@tableflip.io::mx-1.rightbox.com:10:3600
@tableflip.io::mx-2.rightbox.com:10:3600
@tableflip.io::mx-3.rightbox.com:10:3600