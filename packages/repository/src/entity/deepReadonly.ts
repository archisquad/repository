import { DeepReadonly } from "./types"

function validateCustomTypes<TValue>(value: TValue): boolean {
  const excludedTypes = [Date, RegExp, Map, Set]
  return !excludedTypes.some((type) => value instanceof type)
}

export function deepReadonly<TWriteableObject extends Record<string, any>>(
  obj: TWriteableObject
): DeepReadonly<TWriteableObject> {
  Reflect.ownKeys(obj).forEach((key) => {
    const value = obj[key as keyof TWriteableObject]
    if (
      value &&
      typeof value === "object" &&
      validateCustomTypes(value) &&
      Object.isFrozen(value) === false
    ) {
      // @ts-expect-error - we know that value is object
      obj[key as keyof TWriteableObject] = deepReadonly(value)
    }
  })

  return Object.freeze(obj) as DeepReadonly<TWriteableObject>
}

export function readonlyClone<TData extends Record<string, any>>(
  data: TData
): DeepReadonly<TData> {
  // TODO: add polyfill for structuredClone
  // eslint-disable-next-line compat/compat
  const clonedData = structuredClone(data)

  return deepReadonly(clonedData)
}
