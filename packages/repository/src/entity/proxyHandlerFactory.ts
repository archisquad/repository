import type { ProxyTarget } from "./interface"

const allowedSymbolKeys = new Set([
  Symbol.hasInstance,
  Symbol.isConcatSpreadable,
  Symbol.iterator,
  Symbol.toStringTag,
])

const allowedInternalMethods = new Set(["toJson", "toObject"])

export function proxyHandlerFactory<TProxied extends ProxyTarget>(
  updateEntityFn: (data: any) => any,
  methods: any = {}
): ProxyHandler<TProxied> {
  return {
    get(target, prop, receiver) {
      if (prop === "data") {
        return {}
      }

      if (
        Reflect.has(target.internalEntity.data, prop) ||
        allowedSymbolKeys.has(prop as symbol)
      ) {
        return Reflect.get(target.internalEntity.data, prop, receiver)
      }

      // The update method & getIdentifier are not overridable
      if (prop === "update") {
        return (...args: any) => updateEntityFn.apply(target, args)
      }

      if (prop === "getIdentifier") {
        return () => target.internalEntity.getIdentifier()
      }

      // User defined methods, takes precedence over internal methods
      if (Reflect.has(methods, prop)) {
        return function (...args: any[]) {
          return methods[prop].apply(
            // @ts-expect-error -- proxy handler
            this === receiver ? target.internalEntity.data : this,
            args
          )
        }
      }

      if (allowedInternalMethods.has(prop as string)) {
        return function (...args: any[]) {
          return target.internalEntity[prop].apply(
            // @ts-expect-error -- proxy handler
            this === receiver ? target.internalEntity : this,
            args
          )
        }
      }

      if (Reflect.has(target.relationAccessor, prop)) {
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
      return Reflect.has(target.internalEntity.data, prop)
    },
    ownKeys(target) {
      return Reflect.ownKeys(target.internalEntity.data)
    },
    getOwnPropertyDescriptor(target, prop) {
      if (Reflect.has(target.internalEntity.data, prop)) {
        return {
          value: target.internalEntity.data[prop],
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
      return Reflect.getPrototypeOf(target.internalEntity.data)
    },
    setPrototypeOf() {
      throw new Error("You can't change entity prototype.")
    },
  }
}
