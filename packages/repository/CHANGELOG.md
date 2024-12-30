# @archisquad/repository

## 0.1.0

### Minor Changes

- 67265ba: Added support for defining indentifier field by user. Indetifier could be a
  field in Entity model, or a function. It could be left undefined, then Entity
  API assumes that developer stick with the default `id` field.
- e616e3a: Changed way of schema declaration, allowing to use schema libraries such as zod
  or valibot. Added data validation in runtime during the Entity creation and
  update. Changed way of entity model declaration, introducted the configure
  object and single function invocation instead of previous double. Now, you can
  define function for infer schema type and validator - that way Entity API
  supports your favorite schema library, and still brings no extra dependecies.
  Added possibility to define custom methods on Entity.

### Patch Changes

- e616e3a: Fixed problem with relation types - ealier Entity type was applied with wide
  Relationship type that match every string used on entity object - which gives
  false positive that such key exists on entity.
