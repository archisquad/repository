# Methods

In this section we will explore all nooks and crannies behind methods types.

## The Methods type

### Why?

So basically type `Methods` is defined to declare how methods within Entity are built.\
It will be an object with keys and values


### How?

```ts
export type Methods<TSchema extends EntitySchema> = Record<
  string, // keys
  (this: TSchema, ...args: any[]) => any // values
>
```

::: info EntitySchema
```ts
Record<string, any>
```
:::

It's a `Record` that has keys as strings & methods as values.

The values part seems to be tricky. It indicates a methods that takes
 - `this` of type `TSchema` as it's first parameter.
 - `..args: any[]` as rest. (It means any number of arguments of any type)

::: details Why we indicate `this` of type `TSchema`?
All methods have `this` inside and we must declare it's type. Without it we would get an `unknown` type instead.
We assume that all methods in `Entity` are going to have access to data layer. By defining `this: TSchema` we are giving correct type to `this`. This means that `this` inside entity function will be type of data layer and user will be able to use it without errors.
:::

## Prototype Methods

### Why?

Prototype Methods are default methods inside every entity.\
It doesn't matter what Entity we are going to build we will always have this base methods inside.

### How?

It's an `object` with two keys.

```ts
export type PrototypeMethods<TSchema extends EntitySchema> = {
  toObject(): TSchema
  toJson(): string
}
```

## ResolvedMethods

### Why?

This type is a mechanism for ensuring that the user-defined methods for an `EntitySchema` are appropriately augmented and validated based on a set of `PrototypeMethods`.

::: info
When factory function infers `TMethods` without union with undefined it set value of the `TMethods` to `Methods<TSchema>` - which makes it impossible to detect on the type level if the user defined any methods but when we set `TMethods` to `Methods<TSchema> | undefined` it will be possible to detect it.
:::

### How?

```ts
export type ResolvedMethods<
  TSchema extends EntitySchema,
  TMethods extends Methods<TSchema> | undefined,
> = (
  TMethods extends Methods<TSchema>
    ? TMethods extends undefined
      ? "false"
      : "true"
    : 0
) extends "true"
  ? TMethods extends Methods<TSchema>
    ? {
        [Key in Exclude<
          keyof PrototypeMethods<TSchema>,
          keyof TMethods
        >]: PrototypeMethods<TSchema>[Key]
      } & Except<TMethods, "update" | "getIdentifier">
    : never
  : PrototypeMethods<TSchema>
```

The `ResolvedMethods` type uses conditional types to perform this check and manipulation. It leverages TypeScript's behavior with union types and conditional types to make these distinctions. 🤯

To have a better view we will breakdown `ResolvedMethods` step by step

#### 1. Generics

- `TSchema` - which is a data layer for entity,
- `TMethods` - which is an `object` of user-defined methods or `undefined`

#### 2. Conditionals for User-Defined Methods

```ts
(
  TMethods extends Methods<TSchema>
    ? TMethods extends undefined
      ? "false"
      : "true"
    : 0
)
```
It's a part where type need to check if user defined any methods. Type calculates correct input to proceed.

This type uses double check if `TMethods` are equal to `Methods` and to `undefined`.
By this operation we are sure that we talking about non declared `TMethods` by user.
Why? Because TypeScript can't explicit and clearly tell it's undefined - it uses union
of undefined and the type used in extends check - so it's `Methods<TSchema> | undefined`.

When we detect state of not declared `TMethods` we are using string literal type "true" to
mark it. TypeScript has Distributive Conditional Types mechanism it will check
union `Methods<TSchema> | undefined` twice, and answer will be `false | 0`.

Such combination will without any problems rejected from next conditional type check for `"true"` literal.
It's important here to combine two primitives types, not any other such as undefined or unknown.

The `0` is kinda random, we need to return anything but `"true"`.

The calculations will be always an union (Type is running mechanism twice for `Methods<TSchema>` & `undefined`)
and result will contain `"true"` or `"false"` or `0`

#### 3. Augmentation of Methods

```ts
 ... extends "true"
  ? TMethods extends Methods<TSchema>
    ? {
        [Key in Exclude<
          keyof PrototypeMethods<TSchema>,
          keyof TMethods
        >]: PrototypeMethods<TSchema>[Key]
      } & Except<TMethods, "update" | "getIdentifier">
    : never
  : PrototypeMethods<TSchema>
```

If Calculations from [Conditionals for User-Defined Methods](#_2-conditionals-for-user-defined-methods) is labeled as `"true"` it means that the user has explicitly defined methods.\
Type then checks if the user-defined methods (`TMethods`) are a subset of the prototype methods (`PrototypeMethods<TSchema>`).
If they are, Type augments the user-defined methods with additional prototype methods, excluding specific keys (`update` and `getIdentifier`).

If Calculations from [Conditionals for User-Defined Methods](#_2-conditionals-for-user-defined-methods) is labeled as `"false"` (meaning it's not explicitly defined), the type defaults to using the prototype methods (`PrototypeMethods<TSchema>`).

#### 4. Resulting Type:

The resulting type is a combination of
 - prototype methods
 - user-defined methods (ensuring that the user-defined methods are properly augmented based on the prototype methods).
