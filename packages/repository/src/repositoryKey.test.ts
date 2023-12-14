import { RepositoryKey, makeRepositoryKey } from "./repositoryKey"
import { describe, expect, expectTypeOf, it } from "vitest"

describe("Given a repository name, When create a repository key,", () => {
  it("Then the key is a symbol", () => {
    const repositoryName = "test"

    const repositoryKey = makeRepositoryKey<
      { a: string },
      typeof repositoryName
    >(repositoryName)

    expect(repositoryKey).toBeDefined()
    expect(repositoryKey).toBeTypeOf("symbol")
  })

  it("Then transfer a Entity schema type", () => {
    const repositoryName = "test"

    const repositoryKey = makeRepositoryKey<
      { a: string },
      typeof repositoryName
    >(repositoryName)

    expectTypeOf(repositoryKey).toEqualTypeOf<
      symbol & {
        __repository: typeof repositoryName
        __schema: { a: string }
      }
    >()
  })

  it("Then transfer a repository name", () => {
    const repositoryName = "test"
    type RepositorySchema = { a: string }

    const repositoryKey = makeRepositoryKey<
      RepositorySchema,
      typeof repositoryName
    >(repositoryName)

    type Recover<TRepo> = TRepo extends RepositoryKey<infer TSchema, string>
      ? TSchema
      : never

    expectTypeOf<
      Recover<typeof repositoryKey>
    >().toEqualTypeOf<RepositorySchema>()
  })
})
