export type RepositoryKey<TSchema, TName extends string> = symbol & {
  __repository: TName
  __schema: TSchema
}

export function makeRepositoryKey<TSchema, const TName extends string>(
  uniqueName: TName
): RepositoryKey<TSchema, TName> {
  return Symbol(uniqueName) as RepositoryKey<TSchema, TName>
}
