import type { ReadonlyDeep } from "type-fest"
import { describe, expect, expectTypeOf, it } from "vitest"
import { deepReadonly } from "./deepReadonly"

describe("Deep Readonly", () => {
  it("Given deep object, When deepReadonly is called, Then return deepReadonly object", () => {
    const obj = {
      foo: "bar",
      bar: {
        foo: "bar",
      },
    }

    const readonlyObj = deepReadonly(obj)

    // It must be the same object, mutation not copy
    expect(readonlyObj).toBe(obj)
    expect(readonlyObj.bar).toBe(obj.bar)
    expectTypeOf(readonlyObj).toMatchTypeOf<ReadonlyDeep<typeof obj>>()
    // Double check for runtime
    expect(() => {
      // @ts-expect-error - we testing runtime
      readonlyObj.foo = "baz"
    }).toThrow()
    expect(() => {
      // @ts-expect-error - we testing runtime
      readonlyObj.bar.foo = "baz"
    }).toThrow()
  })

  it("Given object with Date, Set, Map, RegExp, When deepReadonly is called, Then return object has untouched fields with Date, Set, Map, RegExp", () => {
    const obj = {
      date: new Date(),
      set: new Set(),
      map: new Map(),
      regexp: new RegExp(""),
      other: "field",
    }

    const readonlyObj = deepReadonly(obj)

    expect(readonlyObj.date).toBe(obj.date)
    expectTypeOf(readonlyObj.date).toMatchTypeOf<Date>()
    expect(readonlyObj.set).toBe(obj.set)
    expectTypeOf(readonlyObj.set).toMatchTypeOf<Set<any>>()
    expect(readonlyObj.map).toBe(obj.map)
    expectTypeOf(readonlyObj.map).toMatchTypeOf<Map<any, any>>()
    expect(readonlyObj.regexp).toBe(obj.regexp)
    expectTypeOf(readonlyObj.regexp).toMatchTypeOf<RegExp>()
    expect(readonlyObj.other).toBe(obj.other)
    expect(() => {
      readonlyObj.set.add("test")
    }).not.toThrow()
    expect(() => {
      readonlyObj.map.set("test", "test")
    }).not.toThrow()
  })

  it("Given object already frozen, When deepReadonly is called, Then return object has proper DeepReadonly object", () => {
    const obj = deepReadonly({
      foo: "bar",
      bar: {
        foo: "bar",
      },
    })

    const readonlyObj = deepReadonly(obj)

    expect(readonlyObj).toBe(obj)
    expect(readonlyObj.bar).toBe(obj.bar)
    expectTypeOf(readonlyObj).toMatchTypeOf<ReadonlyDeep<typeof obj>>()
    expect(() => {
      // @ts-expect-error - we testing runtime
      readonlyObj.foo = "baz"
    }).toThrow()
    expect(() => {
      // @ts-expect-error - we testing runtime
      readonlyObj.bar.foo = "baz"
    }).toThrow()
  })
})
