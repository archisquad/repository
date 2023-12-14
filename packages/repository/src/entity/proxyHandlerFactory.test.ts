/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/unbound-method */
import { proxyHandlerFactory } from "./proxyHandlerFactory"
import { Mock, beforeEach, describe, expect, it, vi } from "vitest"

declare module "vitest" {
  interface TestContext {
    fakeProxiedObj: {
      _mockedProto: Mock
      _mockedRelationAccessor: Mock
      proto: any
      relationAccessor: any
    }
    testProxy: any
  }
}

describe("proxyHandlerFactory", () => {
  beforeEach((ctx) => {
    ctx.fakeProxiedObj = {
      _mockedProto: vi.fn().mockReturnValue({
        get data() {
          return Object.freeze({
            fakeKey: "fakeValue",
          })
        },
        toObject: vi.fn().mockReturnValue({ fake: "fake" }),
        getIdentifier: vi.fn().mockReturnValue("1"),
      }),
      _mockedRelationAccessor: vi.fn().mockReturnValue({
        fakeRelation: () => ({
          id: 1,
          name: "fakeRelated",
        }),
      }),
      get proto() {
        return this._mockedProto()
      },
      get relationAccessor() {
        return this._mockedRelationAccessor()
      },
    }
    const proxyHandler = proxyHandlerFactory<typeof ctx.fakeProxiedObj>(vi.fn())
    ctx.testProxy = new Proxy(ctx.fakeProxiedObj, proxyHandler) as any
  })

  it("When factory called, Then return proxy handler with traps", ({
    fakeProxiedObj,
  }) => {
    const proxyHandler = proxyHandlerFactory<typeof fakeProxiedObj>(vi.fn())

    expect(proxyHandler).toEqual({
      get: expect.any(Function),
      set: expect.any(Function),
      deleteProperty: expect.any(Function),
      has: expect.any(Function),
      ownKeys: expect.any(Function),
      getOwnPropertyDescriptor: expect.any(Function),
      defineProperty: expect.any(Function),
      getPrototypeOf: expect.any(Function),
      setPrototypeOf: expect.any(Function),
    })
  })

  it("Given proxy with handler, When call toObject(), Then return toObject() function from proto object", ({
    testProxy,
  }) => {
    expect(testProxy.toObject).toBeInstanceOf(Function)
    expect(testProxy.toObject()).toEqual({ fake: "fake" })
  })

  it("Given proxy with handler, When call getIdentifier(), Then return getIdentifier() function from proto object", ({
    testProxy,
  }) => {
    expect(testProxy.getIdentifier).toBeInstanceOf(Function)
    expect(testProxy.getIdentifier()).toEqual("1")
  })

  it("Given proxy with handler & overrided getIdentifier method, When call getIdentifier(), Then return getIdentifier() function from proto object", ({
    fakeProxiedObj,
  }) => {
    const userDefinedMethods = {
      getIdentifier: function () {
        return "fail"
      },
    }
    const proxyHandler = proxyHandlerFactory<typeof fakeProxiedObj>(
      vi.fn(),
      userDefinedMethods
    )
    const testProxy = new Proxy(fakeProxiedObj, proxyHandler) as any

    expect(testProxy.getIdentifier()).toEqual("1")
  })

  it("Given proxy with handler, When access data key, Then return that key from proto.data() getter", ({
    testProxy,
  }) => {
    expect(testProxy.fakeKey).toEqual("fakeValue")
  })

  it("Given proxy with handler, When call relation-named function, Then return function from relationAccessor object", ({
    testProxy,
  }) => {
    expect(testProxy.fakeRelation()).toEqual({ id: 1, name: "fakeRelated" })
  })

  it("Given proxy with handler & user-defined methods, When call user-defined method, Then return wrapper-function with applied prototype as this", ({
    fakeProxiedObj,
  }) => {
    const userDefinedMethods = {
      someMethod: function () {
        return this
      },
    }
    const proxyHandler = proxyHandlerFactory<typeof fakeProxiedObj>(
      vi.fn(),
      userDefinedMethods
    )
    const testProxy = new Proxy(fakeProxiedObj, proxyHandler) as any

    expect(testProxy.someMethod()).toEqual(fakeProxiedObj.proto.data)
  })

  it("Given proxy with handler, When call data property, Then return empty object", ({
    testProxy,
  }) => {
    expect(testProxy.data).toEqual({})
  })

  it("Given proxy with handler, When set property, Then throw error", ({
    testProxy,
  }) => {
    expect(() => {
      testProxy.fakeKey = "fakeValue"
    }).toThrowError(
      "You can't overwrite entity properties, use update() instead."
    )
  })

  it("Given proxy with handler, When use in operator, Then check field existence on internal data object", ({
    testProxy,
  }) => {
    expect("fakeKey" in testProxy).toBe(true)
    expect("otherFake" in testProxy).toBe(false)
    expect("toObject" in testProxy).toBe(false)
    expect("fakeRelation" in testProxy).toBe(false)
  })

  it("Given proxy with handler, When Object.keys(), Then return keys from internal data object", ({
    testProxy,
  }) => {
    expect(Reflect.ownKeys(testProxy)).toEqual(["fakeKey"])
  })

  it("Given proxy with handler, When Object.getOwnPropertyDescriptor() with data key, Then return descriptor from internal data object", ({
    testProxy,
  }) => {
    expect(Reflect.getOwnPropertyDescriptor(testProxy, "fakeKey")).toEqual({
      configurable: true,
      enumerable: true,
      value: "fakeValue",
      writable: false,
    })
  })

  it("Given proxy with handler, When Object.getOwnPropertyDescriptor() with relation key, Then return descriptor from relationAccessor object", ({
    testProxy,
  }) => {
    expect(
      Object.getOwnPropertyDescriptor(testProxy, "fakeRelation")
    ).toBeUndefined()
  })

  it("Given proxy with handler, When Object.getOwnPropertyDescriptor with method key, Then return descriptor from proto object", ({
    testProxy,
  }) => {
    expect(
      Object.getOwnPropertyDescriptor(testProxy, "toObject")
    ).toBeUndefined()
  })

  it("Given proxy with handler, When delete property, Then throw error", ({
    testProxy,
  }) => {
    expect(() => {
      delete testProxy.fakeKey
    }).toThrowError("You can't delete entity properties, use update() instead.")
  })

  it("Given proxy with handler, When defineProperty, Then do nothing", ({
    testProxy,
  }) => {
    expect(() => {
      Object.defineProperty(testProxy, "fakeKey", {
        value: "fakeValue",
      })
    }).toThrowError(
      "You can't define entity properties, create new Entity context and use createEntity() instead."
    )
  })

  it("Given proxy with handler, When getPrototypeOf, Then return undefined", ({
    testProxy,
  }) => {
    expect(Reflect.getPrototypeOf(testProxy)).toMatchInlineSnapshot("{}")
  })

  it("Given proxy with handler, When setPrototypeOf, Then throw error", ({
    testProxy,
  }) => {
    expect(() => {
      Reflect.setPrototypeOf(testProxy, {})
    }).toThrowError("You can't change entity prototype.")
  })

  it("Given proxy with handler, When iterate over proxy, Then iterate over internal data object", ({
    testProxy,
  }) => {
    const keys = []
    for (const key in testProxy) {
      keys.push(key)
    }
    expect(keys).toEqual(["fakeKey"])
  })

  it("Given proxy with handler, When spread proxy, Then spread internal data object", ({
    testProxy,
  }) => {
    const spreaded = { ...testProxy }
    expect(spreaded).toEqual({ fakeKey: "fakeValue" })
  })

  it("Given proxy with handler, When access non-existing key, Then throw error", ({
    testProxy,
  }) => {
    expect(() => {
      const value = testProxy.nonExistingKey
    }).toThrowError("Property 'nonExistingKey' does not exist on this entity.")
  })
})
