import { DeepReadonly } from "./types"

export function deepReadonly<TWriteableObject extends Record<string, any>>(
  obj: TWriteableObject
): DeepReadonly<TWriteableObject> {
  Reflect.ownKeys(obj).forEach((key) => {
    const value = obj[key as keyof TWriteableObject]
    if (checkIsObject(value)) {
      // @ts-expect-error - we know that value is object
      obj[key as keyof TWriteableObject] = deepReadonly(value)
    }
  })

  return Object.freeze(obj) as DeepReadonly<TWriteableObject>
}

function checkIsObject(value: unknown): value is object {
  if (!value) {
    return false
  }

  if (typeof value !== "object") {
    return false
  }

  if (!validateCustomTypes(value)) {
    return false
  }

  if (Object.isFrozen(value)) {
    return false
  }

  return true
}

function validateCustomTypes<TValue>(value: TValue): boolean {
  const excludedTypes = [Date, RegExp, Map, Set]
  return !excludedTypes.some((type) => value instanceof type)
}
