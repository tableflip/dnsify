# dnsify - Simplify your dns config

A human friendly format for **defining** and **documenting** and your DNS config and a tool for **verifying** and **applying** it to your friendly dns service provider.

e.g **tableflip.io.dns.md**
```markdown
## Origin: tableflip.io

name       | type | data
-----------|------|---------------
@ www blog | A    | 178.62.82.182
@          | MX   | mx-{1,3}.rightbox.com:10
```

## Why

- Documentation _is_ the config.
- Reduce the repetition (looking at you zonefiles, OMG)
- Prefer readability over opaque terseness (`tinydns`, I <3 you, but why you make me RTFM every time?)

## What
- Convert a Markdown table to an "Abstract Zone File" object
- Merge multiple tables into one zone object
- Understand shell style brace expansions `{1,2}.foo.com` **=>** `1.foo.com 2.foo.com`
- Output a zonefile or JSON

## Usage

```sh
dnsify examples/tableflip.io.dns.md

$ORIGIN tableflip.io.
$TTL 1h
@    IN A  178.62.82.182
www  IN A  178.62.82.182
@    IN MX 10 mx-1.rightbox.com.
...

dnsify examples/tableflip.io.dns.md --json

{
  "origin": "tableflip.io",
  "ttl": "1h",
  "records" : [
    {
      "type": "A",
      "name": "@",
      "data": "178.62.82.182"
    }
  ]
}
```

## Examples

`examples/zone-file-style.dns.md`

### Origin: tableflip.io

The no frills "DNS Zone file as markdown table" style

name      | type | data
----------|------|---------------
@         | A    | 178.62.82.182
www       | A    | @
blog      | A    | @
next      | A    | 212.110.189.58
@         | MX   | mx-1.rightbox.com:10
@         | MX   | mx-2.rightbox.com:10
@         | MX   | mx-3.rightbox.com:10
@         | TXT  | `v=spf1 include:_spf.google.com include:_spf.freeagent.com ~all`


---

`examples/dry-style.dns.md`

### Origin: tableflip.io

DRY style. Order the columns however you like, Multiple tables are merged, lists are expanded.
The result is **the same as the previous example**

data           | type | name
-------------- |------|--------------
178.62.82.182  | A    | @ www blog
212.110.189.58 | A    | next

type | data
-----|------
MX   | mx-{1,2,3}.rightbox.com:10
TXT  | `v=spf1 include:_spf.google.com include:_spf.freeagent.com ~all`
