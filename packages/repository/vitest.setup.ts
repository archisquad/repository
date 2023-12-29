import type { Simplify } from "type-fest"
import type { Faker } from "@faker-js/faker"
import type { EntityKey } from "@/entity/interface"
import type { SyncKey } from "@/network/interface/sync"
import type { RepositoryKey } from "@/repositoryKey"
import { makeSyncKey } from "@/network/sync"
import { faker } from "@faker-js/faker"
import { beforeEach } from "vitest"
import { z } from "zod"

const zodSchema = z.object({
  id: z.string().cuid2(),
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
    id: string
    foo: string
    bar: number
    deep?: {
      foo: string
      bar: string
    }
    some: boolean
  }

  export type TestEntityData = Simplify<
    TestRawEntityData & {
      id: EntityKey
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
    zodInferFn: (input: typeof zodSchema) => TestEntityData
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
    return input.shape as unknown as z.infer<typeof input>
  }
  context.zodValidatorFn = (schema: typeof zodSchema, input: unknown) => {
    return schema.parse(input)
  }
  context.passThroughValidator = <TInput>(input: TInput) => input
})

function generateFakeObj(faker: Faker) {
  return {
    id: faker.string.uuid(),
    foo: faker.person.fullName(),
    bar: faker.number.int(),
    deep: {
      foo: faker.person.firstName(),
      bar: faker.person.lastName(),
    },
    some: faker.datatype.boolean(),
  }
}
