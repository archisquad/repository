---
"@archisquad/repository": patch
---

Fixed problem with relation types - ealier Entity type was applied with wide
Relationship type that match every string used on entity object - which gives
false positive that such key exists on entity.
