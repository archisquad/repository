import { DeepReadonly } from "./types"

export function deepReadonly<TWriteableObject extends Record<string, any>>(
  obj: TWriteableObject
): DeepReadonly<TWriteableObject> {
  for (const key of Reflect.ownKeys(obj)) {
    const value = obj[key as keyof TWriteableObject]
    if (checkIsObject(value)) {
      obj[key as keyof TWriteableObject] = deepReadonly(
        value
      ) as TWriteableObject[keyof TWriteableObject]
    }
  }

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
