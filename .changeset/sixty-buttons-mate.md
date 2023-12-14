---
"@archisquad/repository": minor
---

Added support for defining indentifier field by user. Indetifier could be a
field in Entity model, or a function. It could be left undefined, then Entity
API assumes that developer stick with the default `id` field.
