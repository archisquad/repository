export type DeepReadonly<TData> = {
  readonly [Key in keyof TData]: TData[Key] extends Record<string, any>
    ? TData[Key] extends
        | Set<any>
        | Map<any, any>
        | Date
        | RegExp
        | ((...args: any[]) => any)
      ? TData[Key]
      : DeepReadonly<TData[Key]>
    : TData[Key]
}

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
