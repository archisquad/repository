/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ProxyTarget } from "./interface"

const allowedSymbolKeys = new Set([
  Symbol.hasInstance,
  Symbol.isConcatSpreadable,
  Symbol.iterator,
  Symbol.toStringTag,
])

const allowedInternalMethods = new Set([
  "toJson",
  "toObject",
  "isSynced",
  "setSynced",
])

export function proxyHandlerFactory<TProxied extends ProxyTarget>(
  updateEntityFn: (data: any) => any
): ProxyHandler<TProxied> {
  return {
    get(target, prop, receiver) {
      if (prop === "data") {
        return {}
      }

      if (prop in target.proto.data || allowedSymbolKeys.has(prop as symbol)) {
        return Reflect.get(target.proto.data, prop, receiver)
      }

      if (prop === "update") {
        return function (...args: any) {
          return updateEntityFn.apply(target, args)
        }
      }

      if (allowedInternalMethods.has(prop as string)) {
        return function (...args: any[]) {
          return target.proto[prop].apply(
            // @ts-expect-error -- proxy handler
            this === receiver ? target.proto : this,
            args
          )
        }
      }

      if (prop in target.relationAccessor) {
        return target.relationAccessor[prop]
      }

      throw new Error(
        `Property '${prop.toString()}' does not exist on this entity.`
      )
    },
    set() {
      throw new Error(
        "You can't overwrite entity properties, use update() instead."
      )
    },
    has(target, prop) {
      return Reflect.has(target.proto.data, prop)
    },
    ownKeys(target) {
      return Reflect.ownKeys(target.proto.data)
    },
    getOwnPropertyDescriptor(target, prop) {
      if (prop in target.proto.data) {
        return {
          value: target.proto.data[prop],
          writable: false,
          enumerable: true,
          configurable: true,
        }
      }
    },
    deleteProperty() {
      throw new Error(
        "You can't delete entity properties, use update() instead."
      )
    },
    defineProperty() {
      throw new Error(
        "You can't define entity properties, create new Entity context and use createEntity() instead."
      )
    },
    getPrototypeOf(target) {
      return Reflect.getPrototypeOf(target.proto.data)
    },
    setPrototypeOf() {
      throw new Error("You can't change entity prototype.")
    },
  }
}
