import { Except } from "type-fest"
import { EntitySchema } from "./data"
import { SyncKey } from "./sync"

export type Methods<TSchema extends EntitySchema> = Record<
  string,
  (this: TSchema, ...args: any[]) => any
>

export type PrototypeMethods<TSchema extends EntitySchema> = {
  toObject(): TSchema
  toJson(): string
  isSynced(id: SyncKey): boolean
  setSynced(id: SyncKey, promise: Promise<unknown>): void
}

/**
 * @description
 * When factory function infers `TMethods` without union with undefined it
 * set value of the `TMethods` to `Methods<TSchema>` - which makes it impossible
 * to detect on the type level if the user defined any methods. But when we set `TMethods`
 * to `Methods<TSchema> | undefined` it will be possible to detect it.
 *
 * This type uses double check if `TMethods` are equal to `Methods` and to `undefined`.
 * By this operation we are sure that we talking about non declared `TMethods` by user.
 * Why? Because TypeScript can't explicit and clearly tell it's undefined - it uses union
 * of undefined and the type used in extends check - so it's `Methods<TSchema> | undefined`.
 *
 * When we detect state of not declared `TMethods` we are using string literal type "true" to
 * mark it. Because TypeScript has Distributive Conditional Types mechanism it will check
 * union `Methods<TSchema> | undefined` twice, and answer will be `false | 0`. Such combination
 * will without any problems rejected from next conditional type check for "true" literal.
 * It's important here to combine two primitives types, not any other such as undefined or unknown.
 */
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
