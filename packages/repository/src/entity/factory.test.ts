import { makeRepositoryKey } from "@/repositoryKey"
import type { ObjectSchema, Output } from "valibot"
import { boolean, cuid2, number, object, string } from "valibot"
import type { TestEntityData } from "vitest"
import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest"
import { entityModelFactory } from "./factory"
import { makeSyncKey } from "../network/sync"

describe("Entity", () => {
  beforeEach((context) => {
    context.authorsRepositoryKey = makeRepositoryKey<
      {
        id: string
        name: string
      },
      "authors"
    >("authors")
    context.authorsRelationship = {
      type: "belongs-to",
      foreignRepository: context.authorsRepositoryKey,
      foreignKey: "id",
      localKey: "bar",
    }
    context.serializedEntity = JSON.stringify({
      id: "super-unique-id",
      foo: "bar",
    })

    vi.clearAllMocks()
  })

  describe("Factories", () => {
    describe("Model Factory", () => {
      it("Given schema, relations, sync keys, methods, When entity model factory called, Then return entity factories", ({
        zodSchema,
        zodInferFn,
        entityMethods,
        syncKeys,
        authorsRelationship,
      }) => {
        const result = entityModelFactory({
          schema: zodSchema,
          inferSchema: zodInferFn,
          methods: entityMethods,
          relations: { author: authorsRelationship },
          syncDestinations: syncKeys,
        })

        expect(result).toEqual(
          expect.objectContaining({
            createEntity: expect.any(Function),
            recoverEntity: expect.any(Function),
          })
        )
      })

      it("Given schema, relations, When entity model factory called, Then return entity factories", ({
        zodSchema,
        zodInferFn,
        authorsRelationship,
      }) => {
        const result = entityModelFactory({
          schema: zodSchema,
          inferSchema: zodInferFn,
          relations: { author: authorsRelationship },
        })

        expect(result).toEqual(
          expect.objectContaining({
            createEntity: expect.any(Function),
            recoverEntity: expect.any(Function),
          })
        )
      })

      it("Given schema, methods, When entity model factory called, Then return entity factories", ({
        zodSchema,
        zodInferFn,
        entityMethods,
      }) => {
        const result = entityModelFactory({
          schema: zodSchema,
          inferSchema: zodInferFn,
          methods: entityMethods,
        })

        expect(result).toEqual(
          expect.objectContaining({
            createEntity: expect.any(Function),
            recoverEntity: expect.any(Function),
          })
        )
      })

      it("Given schema, When entity model factory called, Then return entity factories", ({
        zodSchema,
        zodInferFn,
      }) => {
        const result = entityModelFactory({
          schema: zodSchema,
          inferSchema: zodInferFn,
        })

        expect(result).toEqual(
          expect.objectContaining({
            createEntity: expect.any(Function),
            recoverEntity: expect.any(Function),
          })
        )
      })

      it("Given schema, selected schema key as identifier, When entity model factory called, Then return entity factories", ({
        zodSchema,
        zodInferFn,
      }) => {
        const result = entityModelFactory({
          schema: zodSchema,
          inferSchema: zodInferFn,
          identifier: "foo",
        })

        expect(result).toEqual(
          expect.objectContaining({
            createEntity: expect.any(Function),
            recoverEntity: expect.any(Function),
          })
        )
      })

      it("Given schema, getter fn as identifier, When entity model factory called, Then return entity factories", ({
        zodSchema,
        zodInferFn,
      }) => {
        const result = entityModelFactory({
          schema: zodSchema,
          inferSchema: zodInferFn,
          identifier: (data) => data.foo,
        })

        expect(result).toEqual(
          expect.objectContaining({
            createEntity: expect.any(Function),
            recoverEntity: expect.any(Function),
          })
        )
      })
    })

    describe("Entity Factory", () => {
      it("Given schema, When entity factory called, Then return entity with given data", ({
        zodSchema,
        zodInferFn,
        fakeData,
      }) => {
        const entityFactory = entityModelFactory({
          schema: zodSchema,
          inferSchema: zodInferFn,
        })

        const entity = entityFactory.createEntity(fakeData)

        expect(entity).toEqual(
          expect.objectContaining({
            foo: fakeData.foo,
          })
        )
      })

      it("Given schema, selected schema key as identifier, When entity factory called, Then return entity with identifier", ({
        zodSchema,
        zodInferFn,
        fakeData,
      }) => {
        const entityFactory = entityModelFactory({
          schema: zodSchema,
          inferSchema: zodInferFn,
          identifier: "foo",
        })

        const entity = entityFactory.createEntity({
          ...fakeData,
          id: "anything",
        })

        expect(entity.getIdentifier()).toEqual(fakeData.foo)
      })

      it("Given schema, getter fn as identifier, When entity factory called, Then return entity with identifier", ({
        zodSchema,
        zodInferFn,
        fakeData,
      }) => {
        const entityFactory = entityModelFactory({
          schema: zodSchema,
          inferSchema: zodInferFn,
          identifier: (data) => data.foo,
        })

        const entity = entityFactory.createEntity({
          ...fakeData,
          id: "anything",
        })

        expect(entity.getIdentifier()).toEqual(fakeData.foo)
      })

      it("Given schema, When entity factory called, Then return entity with unique identifier", ({
        zodSchema,
        zodInferFn,
        fakeData,
      }) => {
        const entityFactory = entityModelFactory({
          schema: zodSchema,
          inferSchema: zodInferFn,
        })

        const entity = entityFactory.createEntity(fakeData)

        expect(entity.id).toBeDefined()
      })

      it("Given schema, relations, When entity factory called, Then return entity with relations", ({
        zodSchema,
        zodInferFn,
        authorsRelationship,
        fakeData,
      }) => {
        const entityFactory = entityModelFactory({
          schema: zodSchema,
          inferSchema: zodInferFn,
          relations: { author: authorsRelationship },
        })

        const entity = entityFactory.createEntity(fakeData)

        expect(entity.author).toBeDefined()
        expect(entity.author).toBeTypeOf("function")
      })

      it("Given schema, sync keys, When entity factory called, Then return entity with sync keys", ({
        zodSchema,
        zodInferFn,
        fakeData,
      }) => {
        const firstSyncKey = makeSyncKey("foo")
        const entityFactory = entityModelFactory({
          schema: zodSchema,
          inferSchema: zodInferFn,
          syncDestinations: [firstSyncKey],
        })

        const entity = entityFactory.createEntity(fakeData)

        expect(entity.isSynced(firstSyncKey)).toBe(false)
      })

      it("Given schema, methods, When entity factory called, Then return entity with methods", ({
        zodSchema,
        zodInferFn,
        fakeData,
      }) => {
        const testMethod = vi.fn()
        const entityFactory = entityModelFactory({
          schema: zodSchema,
          inferSchema: zodInferFn,
          methods: {
            testMethod,
          },
        })

        const entity = entityFactory.createEntity(fakeData)
        entity.testMethod()

        expect(entity.testMethod).toBeDefined()
        expect(entity.testMethod).toBeTypeOf("function")
        expect(testMethod).toHaveBeenCalled()
      })

      it("Given schema, methods that override prototype methods, When entity factory called, Then return entity with override method", ({
        zodSchema,
        zodInferFn,
        fakeData,
      }) => {
        const testMethod = vi.fn()
        const entityFactory = entityModelFactory({
          schema: zodSchema,
          inferSchema: zodInferFn,
          methods: {
            toJson: testMethod,
          },
        })

        const entity = entityFactory.createEntity(fakeData)
        entity.toJson()

        expect(entity.toJson).toBeDefined()
        expect(entity.toJson).toBeTypeOf("function")
        expect(testMethod).toHaveBeenCalled()
        expectTypeOf(entity.toJson).toEqualTypeOf<typeof testMethod>()
      })
    })

    describe("Recover Entity", () => {
      it("Given serialized entity, When recover entity, Then return entity with given data, And the same ID", ({
        serializedEntity,
        zodSchema,
        zodInferFn,
      }) => {
        const entityFactory = entityModelFactory({
          schema: zodSchema,
          inferSchema: zodInferFn,
        })

        const recoveredEntity = entityFactory.recoverEntity(serializedEntity)

        expect(recoveredEntity).toEqual(
          expect.objectContaining({
            id: "super-unique-id",
            foo: "bar",
          })
        )
      })

      it("Given serialized entity, When recover entity, Then return entity with relations", ({
        authorsRelationship,
        serializedEntity,
        zodSchema,
        zodInferFn,
      }) => {
        const entityFactory = entityModelFactory({
          schema: zodSchema,
          inferSchema: zodInferFn,
          relations: { author: authorsRelationship },
        })

        const recoveredEntity = entityFactory.recoverEntity(serializedEntity)

        expect(recoveredEntity.author).toBeDefined()
        expect(recoveredEntity.author).toBeTypeOf("function")
      })

      it("Given serialized entity, When recover entity, Then return entity with sync keys all set to un-up-to-date", ({
        serializedEntity,
        zodSchema,
        zodInferFn,
      }) => {
        const firstSyncKey = makeSyncKey("foo")
        const entityFactory = entityModelFactory({
          schema: zodSchema,
          inferSchema: zodInferFn,
          syncDestinations: [firstSyncKey],
        })

        const recoveredEntity = entityFactory.recoverEntity(serializedEntity)

        expect(recoveredEntity.isSynced(firstSyncKey)).toBe(false)
      })

      it("Given serialized entity, When recover entity, Then return entity with methods", ({
        serializedEntity,
        zodSchema,
        zodInferFn,
      }) => {
        const testMethod = vi.fn()
        const entityFactory = entityModelFactory({
          schema: zodSchema,
          inferSchema: zodInferFn,
          methods: {
            testMethod,
          },
        })

        const recoveredEntity = entityFactory.recoverEntity(serializedEntity)
        recoveredEntity.testMethod()

        expect(recoveredEntity.testMethod).toBeDefined()
        expect(recoveredEntity.testMethod).toBeTypeOf("function")
        expect(testMethod).toHaveBeenCalled()
      })
    })
  })

  describe("Schema declaration", () => {
    it("Given dummy-object schema, When entity model declared, Then return proper schema type", ({
      fakeData,
    }) => {
      const { createEntity } = entityModelFactory({
        schema: {
          id: "string",
          foo: "string",
          bar: 1,
          deep: {
            foo: "string",
            bar: "string",
          },
          some: true,
        },
        inferSchema: (data) => data,
      })

      const entity = createEntity(fakeData)

      expectTypeOf(entity).toMatchTypeOf<TestEntityData>()
      expect(entity.foo).toBe(fakeData.foo)
    })

    it("Given zod based schema, When entity model declared, Then return proper schema type", ({
      zodSchema,
      zodInferFn,
      fakeData,
    }) => {
      const { createEntity } = entityModelFactory({
        schema: zodSchema,
        inferSchema: zodInferFn,
      })

      const entity = createEntity(fakeData)

      expectTypeOf(entity).toMatchTypeOf<TestEntityData>()
      expect(entity.foo).toBe(fakeData.foo)
    })

    it("Given valibot based schema, When entity model declared, Then return proper schema type", ({
      fakeData,
    }) => {
      const valibotSchema = object({
        id: string([cuid2()]),
        foo: string(),
        bar: number(),
        deep: object({
          foo: string(),
          bar: string(),
        }),
        some: boolean(),
      })

      const valibotInferFn = <TSchema extends ObjectSchema<any>>(
        valibotSchema: TSchema
      ) => {
        return (valibotSchema as { entries: any }).entries as Output<TSchema>
      }
      const { createEntity } = entityModelFactory({
        schema: valibotSchema,
        inferSchema: valibotInferFn,
      })

      const entity = createEntity(fakeData)

      expectTypeOf(entity).toMatchTypeOf<TestEntityData>()
      expect(entity.foo).toBe(fakeData.foo)
    })
  })

  describe("Schema validation", () => {
    it("Given schema with validator, When entity factory called, Then validator called on given data", ({
      zodSchema,
      zodInferFn,
      fakeData,
    }) => {
      const validator = vi.fn()
      const entityFactory = entityModelFactory({
        schema: zodSchema,
        inferSchema: zodInferFn,
        validator,
      })

      entityFactory.createEntity(fakeData)

      expect(validator).toHaveBeenCalledWith(
        zodSchema,
        // id is added by the factory, direct match is not possible
        expect.objectContaining({ ...fakeData, id: expect.any(String) })
      )
    })

    it("Given schema with validator, When entity factory called on proper data, Then entity returned", ({
      zodSchema,
      zodInferFn,
      zodValidatorFn,
      fakeData,
    }) => {
      const entityFactory = entityModelFactory({
        schema: zodSchema,
        inferSchema: zodInferFn,
        validator: zodValidatorFn,
      })

      const entity = entityFactory.createEntity(fakeData)

      expect(entity).toEqual(
        expect.objectContaining({
          foo: fakeData.foo,
        })
      )
    })

    it("Given schema with validator, When entity factory called on invalid data, Then throw error", ({
      zodSchema,
      zodInferFn,
      zodValidatorFn,
      fakeData,
    }) => {
      const entityFactory = entityModelFactory({
        schema: zodSchema,
        inferSchema: zodInferFn,
        validator: zodValidatorFn,
      })

      expect(() =>
        // @ts-expect-error - intentionally testing invalid data
        entityFactory.createEntity({ ...fakeData, foo: 1 })
      ).toThrow()
    })
  })

  describe("Instance", () => {
    it("Given entity, When update, Then update data, And set sync status to un-up-to-date, And keep the same ID, And create new object, And keeps relations untouched", async ({
      authorsRelationship,
      fakeData,
      zodSchema,
      zodInferFn,
    }) => {
      const firstSyncKey = makeSyncKey("foo")
      const secondSyncKey = makeSyncKey("bar")
      const { createEntity } = entityModelFactory({
        schema: zodSchema,
        inferSchema: zodInferFn,
        relations: { author: authorsRelationship },
        syncDestinations: [firstSyncKey, secondSyncKey],
      })

      const entity = createEntity(fakeData)
      const testPromise = Promise.resolve()
      entity.setSynced(firstSyncKey, testPromise)
      await testPromise
      expect(entity.isSynced(firstSyncKey)).toBe(true)

      const updatedEntity = entity.update({
        foo: "baz",
        some: false,
      })

      expect(updatedEntity).not.toBe(entity)
      expect(updatedEntity.id).toBe(entity.id)
      expect(updatedEntity.foo).toBe("baz")
      expect(updatedEntity.some).toBe(false)

      expect(updatedEntity.isSynced(firstSyncKey)).toBe(false)
      expect(updatedEntity.isSynced(secondSyncKey)).toBe(false)

      expect(updatedEntity.author).toBeDefined()
      expectTypeOf(updatedEntity.author).toEqualTypeOf<
        () => { id: string; name: string }
      >()
      expect(updatedEntity.author).toBeTypeOf("function")
    })

    it("Given entity, When update to add data properties, Then updated entity have both data properties", ({
      zodSchema,
      zodInferFn,
      fakeData,
    }) => {
      const { createEntity } = entityModelFactory({
        schema: zodSchema,
        inferSchema: zodInferFn,
      })
      const entity = createEntity(fakeData)

      const updatedEntity = entity.update({
        some: false,
      })

      expect(updatedEntity).not.toBe(entity)
      expect(updatedEntity.foo).toBe(fakeData.foo)
      expect(updatedEntity.some).toBe(false)
    })

    // Look at the comment in EntityInternal.update()
    it.skip("Given entity, When update with id, Then ID is not updated", ({
      zodSchema,
      zodInferFn,
      fakeData,
    }) => {
      const { createEntity } = entityModelFactory({
        schema: zodSchema,
        inferSchema: zodInferFn,
      })
      const entity = createEntity(fakeData)

      const updatedEntity = entity.update({
        // @ts-expect-error - intentionally testing invalid update
        id: "some-id",
      })

      expect(updatedEntity).not.toBe(entity)
      expect(updatedEntity.id).toBe(entity.id)
      expect(updatedEntity.id).not.toBe("some-id")
    })

    it("Given entity, When serialize, Then return serialized entity", ({
      zodSchema,
      zodInferFn,
      fakeData,
    }) => {
      const { createEntity } = entityModelFactory({
        schema: zodSchema,
        inferSchema: zodInferFn,
      })
      const entity = createEntity(fakeData)

      const serializedEntity = entity.toJson()

      expect(JSON.parse(serializedEntity)).toEqual({
        ...fakeData,
        id: entity.id,
      })
    })

    it("Given entity, When dumping to regular object, Then return regular object with data", ({
      zodSchema,
      zodInferFn,
      fakeData,
    }) => {
      const { createEntity } = entityModelFactory({
        schema: zodSchema,
        inferSchema: zodInferFn,
      })
      const entity = createEntity(fakeData)

      const dumpedObject = entity.toObject()

      expect(dumpedObject).toEqual({
        ...fakeData,
        id: entity.id,
      })
    })

    it("Given entity, When setSynced, Then update sync status only", async ({
      zodSchema,
      zodInferFn,
      fakeData,
    }) => {
      const firstSyncKey = makeSyncKey("foo")
      const secondSyncKey = makeSyncKey("bar")
      const entityFactory = entityModelFactory({
        schema: zodSchema,
        inferSchema: zodInferFn,
        syncDestinations: [firstSyncKey, secondSyncKey],
      })
      const entity = entityFactory.createEntity(fakeData)
      expect(entity.isSynced(firstSyncKey)).toBe(false)
      expect(entity.isSynced(secondSyncKey)).toBe(false)
      const id = entity.id

      const fakePromise = Promise.resolve()
      entity.setSynced(firstSyncKey, fakePromise)
      await fakePromise

      expect(entity.isSynced(firstSyncKey)).toBe(true)
      expect(entity.isSynced(secondSyncKey)).toBe(false)
      expect(entity.id).toBe(id)
    })

    it("Given entity with methods, when method called, Then method has access to data", ({
      zodSchema,
      zodInferFn,
      fakeData,
    }) => {
      const { createEntity } = entityModelFactory({
        schema: zodSchema,
        inferSchema: zodInferFn,
        methods: {
          testMethod: function () {
            return this.deep
          },
        },
      })
      const entity = createEntity(fakeData)

      const result = entity.testMethod()

      expect(result).toBe(fakeData.deep)
    })
  })
})
