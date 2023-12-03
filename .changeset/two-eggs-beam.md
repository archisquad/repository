---
"@archisquad/repository": minor
---

Changed way of schema declaration, allowing to use schema libraries such as zod
or valibot. Added data validation in runtime during the Entity creation and
update. Changed way of entity model declaration, introducted the configure
object and single function invocation instead of previous double. Now, you can
define function for infer schema type and validator - that way Entity API
supports your favorite schema library, and still brings no extra dependecies.
Added possibility to define custom methods on Entity.
