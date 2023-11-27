import { SyncKey } from "@/entity/interface"
import { makeSyncKey } from "@/entity/sync"
import type { RepositoryKey } from "@/repositoryKey"
import { Faker, faker } from "@faker-js/faker"
import { Simplify } from "type-fest"
import { beforeEach } from "vitest"
import { z } from "zod"

const zodSchema = z.object({
  foo: z.string(),
  bar: z.number(),
  deep: z.object({
    foo: z.string(),
    bar: z.string(),
  }),
  some: z.boolean(),
})

declare module "vitest" {
  export type TestRawEntityData = {
    foo: string
    bar: number
    deep: {
      foo: string
      bar: string
    }
    some: boolean
  }

  export type TestEntityData = Simplify<
    TestRawEntityData & {
      id: string
    }
  >

  export type PostsRelationDefinition = {
    readonly type: "has-many"
    readonly foreignRepository: RepositoryKey<
      {
        id: string
        name: string
        authorId: string
      },
      "posts"
    >
    readonly foreignKey: "authorId"
    readonly localKey: "foo"
  }

  export type AuthorsRepositoryKey = RepositoryKey<
    {
      id: string
      name: string
    },
    "authors"
  >

  export type AuthorRelationDefinition = {
    readonly type: "belongs-to"
    readonly foreignRepository: AuthorsRepositoryKey
    readonly foreignKey: "id"
    readonly localKey: "bar"
  }

  export interface TestContext {
    faker: typeof faker
    fakeData: ReturnType<typeof generateFakeObj>
    syncKeys: SyncKey[]
    entityMethods: {
      someMethod: (input: string) => { output: typeof input }
    }
    zodSchema: typeof zodSchema
    // TODO: Problem with added ID, to solve in ARC-33
    zodInferFn: (input: typeof zodSchema) => TestRawEntityData
    zodValidatorFn: (
      schema: typeof zodSchema,
      input: unknown
    ) => TestRawEntityData
    passThroughValidator: <TInput>(input: TInput) => TInput
    // TODO: Delete it after refactoring
    foreignRepositoryKey: RepositoryKey<
      {
        id: string
        name: string
        authorId: string
      },
      "posts"
    >
    postsRepositoryKey: RepositoryKey<
      {
        id: string
        name: string
        authorId: string
      },
      "posts"
    >
    authorsRepositoryKey: RepositoryKey<
      {
        id: string
        name: string
      },
      "authors"
    >
    authorsRelationship: AuthorRelationDefinition
    serializedEntity: string
  }
}

beforeEach((context) => {
  context.faker = faker
  context.syncKeys = [makeSyncKey("test")]
  context.fakeData = generateFakeObj(context.faker)
  context.entityMethods = {
    someMethod: (input: string) => ({ output: input }),
  }
  context.zodSchema = zodSchema
  context.zodInferFn = (input: typeof zodSchema) => {
    return {} as z.infer<typeof input>
  }
  context.zodValidatorFn = (schema: typeof zodSchema, input: unknown) => {
    return schema.parse(input)
  }
  context.passThroughValidator = <TInput>(input: TInput) => input
})

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function generateFakeObj(faker: Faker) {
  return {
    foo: faker.person.fullName(),
    bar: faker.number.int(),
    deep: {
      foo: faker.person.firstName(),
      bar: faker.person.lastName(),
    },
    some: faker.datatype.boolean(),
  }
}
