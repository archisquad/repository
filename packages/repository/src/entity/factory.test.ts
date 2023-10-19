/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { entityModelFactory } from "./factory"
import { makeSyncKey } from "./sync"
import { makeRepositoryKey } from "@/repositoryKey"
import {
  TestRawEntityData,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  it,
} from "vitest"

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
      id: "author",
      type: "belongs-to",
      foreignRepository: context.authorsRepositoryKey,
      foreignKey: "id",
      localKey: "bar",
    }
    context.serializedEntity = JSON.stringify({
      id: "super-unique-id",
      foo: "bar",
    })
  })

  describe("Factories", () => {
    describe("Model Factory", () => {
      it("Given schema, When model factory called, Then return context factory", () => {
        const result = entityModelFactory<TestRawEntityData>()

        expect(result).toBeInstanceOf(Function)
      })
    })

    describe("Context Factory", () => {
      it("Given schema, relations, sync keys, When context factory called, Then return entity factories", ({
        syncKeys,
        authorsRelationship,
      }) => {
        const result = entityModelFactory<TestRawEntityData>()(
          [authorsRelationship],
          syncKeys
        )

        expect(result).toEqual(
          expect.objectContaining({
            createEntity: expect.any(Function),
            recoverEntity: expect.any(Function),
          })
        )
      })

      it("Given schema, relations, When context factory called, Then return entity factories", ({
        authorsRelationship,
      }) => {
        const result = entityModelFactory<TestRawEntityData>()([
          authorsRelationship,
        ])

        expect(result).toEqual(
          expect.objectContaining({
            createEntity: expect.any(Function),
            recoverEntity: expect.any(Function),
          })
        )
      })

      it("Given schema, When context factory called, Then return entity factories", () => {
        const result = entityModelFactory<TestRawEntityData>()()

        expect(result).toEqual(
          expect.objectContaining({
            createEntity: expect.any(Function),
            recoverEntity: expect.any(Function),
          })
        )
      })
    })

    describe("Entity Factory", () => {
      it("Given schema, When entity factory called, Then return entity with given data", () => {
        const entityFactory = entityModelFactory<TestRawEntityData>()()

        const data = {
          foo: "bar",
        }

        const entity = entityFactory.createEntity(data)

        expect(entity).toEqual(
          expect.objectContaining({
            foo: "bar",
          })
        )
      })

      it("Given schema, When entity factory called, Then return entity with unique identifier", () => {
        const entityFactory = entityModelFactory<TestRawEntityData>()()

        const data = {
          foo: "bar",
        }

        const entity = entityFactory.createEntity(data)

        expect(entity.id).toBeDefined()
      })

      it("Given schema, relations, When entity factory called, Then return entity with relations", ({
        authorsRelationship,
      }) => {
        const entityFactory = entityModelFactory<TestRawEntityData>()([
          authorsRelationship,
        ])
        const data = {
          foo: "bar",
        }

        const entity = entityFactory.createEntity(data)

        expect(entity.author).toBeDefined()
        expect(entity.author).toBeTypeOf("function")
      })

      it("Given schema, sync keys, When entity factory called, Then return entity with sync keys", () => {
        const firstSyncKey = makeSyncKey("foo")
        const entityFactory = entityModelFactory<TestRawEntityData>()(
          [],
          [firstSyncKey]
        )
        const data = {
          foo: "bar",
        }

        const entity = entityFactory.createEntity(data)

        expect(entity.isSynced(firstSyncKey)).toBe(false)
      })
    })

    describe("Recover Entity", () => {
      it("Given serialized entity, When recover entity, Then return entity with given data, And the same ID", ({
        serializedEntity,
      }) => {
        const entityFactory = entityModelFactory<TestRawEntityData>()()

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
      }) => {
        const entityFactory = entityModelFactory<TestRawEntityData>()([
          authorsRelationship,
        ])

        const recoveredEntity = entityFactory.recoverEntity(serializedEntity)

        expect(recoveredEntity.author).toBeDefined()
        expect(recoveredEntity.author).toBeTypeOf("function")
      })

      it("Given serialized entity, When recover entity, Then return entity with sync keys all set to un-up-to-date", ({
        serializedEntity,
      }) => {
        const firstSyncKey = makeSyncKey("foo")
        const entityFactory = entityModelFactory<TestRawEntityData>()(
          [],
          [firstSyncKey]
        )

        const recoveredEntity = entityFactory.recoverEntity(serializedEntity)

        expect(recoveredEntity.isSynced(firstSyncKey)).toBe(false)
      })
    })
  })

  describe("Instance", () => {
    it("Given entity, When update, Then update data, And set sync status to un-up-to-date, And keep the same ID, And create new object, And keeps relations untouched", async ({
      authorsRelationship,
    }) => {
      const firstSyncKey = makeSyncKey("foo")
      const secondSyncKey = makeSyncKey("bar")
      const { createEntity } = entityModelFactory<TestRawEntityData>()(
        [authorsRelationship],
        [firstSyncKey, secondSyncKey]
      )
      const entity = createEntity({
        foo: "bar",
      })
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

    it("Given entity, When update to add data properties, Then updated entity have both data properties", () => {
      const { createEntity } = entityModelFactory<TestRawEntityData>()()
      const entity = createEntity({
        foo: "bar",
      })

      const updatedEntity = entity.update({
        some: false,
      })

      expect(updatedEntity).not.toBe(entity)
      expect(updatedEntity.foo).toBe("bar")
      expect(updatedEntity.some).toBe(false)
    })

    it("Given entity, When update with id, Then ID is not updated", () => {
      const { createEntity } = entityModelFactory<TestRawEntityData>()()
      const entity = createEntity({
        foo: "bar",
      })

      const updatedEntity = entity.update({
        // @ts-expect-error - intentionally testing invalid update
        id: "some-id",
      })

      expect(updatedEntity).not.toBe(entity)
      expect(updatedEntity.id).toBe(entity.id)
      expect(updatedEntity.id).not.toBe("some-id")
    })

    it("Given entity, When serialize, Then return serialized entity", () => {
      const { createEntity } = entityModelFactory<TestRawEntityData>()()
      const data = {
        foo: "bar",
      }
      const entity = createEntity(data)

      const serializedEntity = entity.toJson()

      expect(JSON.parse(serializedEntity)).toEqual({
        ...data,
        id: entity.id,
      })
    })

    it("Given entity, When dumping to regular object, Then return regular object with data", () => {
      const { createEntity } = entityModelFactory<TestRawEntityData>()()
      const data = {
        foo: "bar",
      }
      const entity = createEntity(data)

      const dumpedObject = entity.toObject()

      expect(dumpedObject).toEqual({
        ...data,
        id: entity.id,
      })
    })

    it("Given entity, When setSynced, Then update sync status only", async () => {
      const firstSyncKey = makeSyncKey("foo")
      const secondSyncKey = makeSyncKey("bar")
      const entityFactory = entityModelFactory<TestRawEntityData>()(
        [],
        [firstSyncKey, secondSyncKey]
      )
      const data = {
        foo: "bar",
      }
      const entity = entityFactory.createEntity(data)
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
  })
})
