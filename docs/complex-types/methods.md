# methods

In this section we will explore 🚀 all nooks and crannies behind methods types.



Diving into `methods.ts` we have these three imports

```ts
import { EntitySchema } from "./data" // Record<string, any>
import { SyncKey } from "./sync" // Opaque<string, "sync-key">
import { Except } from "type-fest" // Create a type from an object type without certain keys.
```

## Methods

```ts
export type Methods<TSchema extends EntitySchema> = Record<
  string, // keys
  (this: TSchema, ...args: any[]) => any // values
>
```

`Methods<TSchema>`: This is a generic type called `Methods`. It takes a type parameter `TSchema`, which is expected to extend the `EntitySchema`.<br/>
This means that `Methods` is a reusable type where we can use it for different EntityType. (dunno if I should explain this @TODO)


```ts
Record<string, ...>
```
This denotes as an 	__*object*__ type where keys are `strings`. Pretty logic, methods must be somehow named.

```ts
(this: TSchema, ...args: any[]) => any
```
This is the type of values in the __*object*__.<br/>
It indicates a function that takes Ż
 - `this` of type `TSchema` (the entity schema) as its first parameter. (We need to have an access to the object with data inside a function)
 - `..args: any[]` means any number of arguments of any type (`rest syntax`)

     