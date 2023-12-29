## Identifier - unique identifier specified by the user, providing its key from TSchema or a function resolving it.

The `ResolveIdentifier` type is intended to specify the type of identifier in the Schema uniquely.

If the identifier has not been specified by the user, the DefaultIdentifier will be returned as a fallback to `string`.

If specified, it must be a key in the Schema or a function generating the identifier. In the case of being a key, the returned identifier will be of the corresponding value type.

If it is a function, the type will match the type returned from the function.

| Identifier | Resolved type      |
|------------|--------------------|
| `undefined`| `string`           |
| `keyof Schema` | `Schema[key]`    |
| `(data: Schema) => Foo` | `Foo`       |

The UpdateEntityInput type is used in functions updating data and aims to secure against updating the identifier to ensure data integrity.
