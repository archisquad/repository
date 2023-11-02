/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { validateInput } from "./validation"
import { describe, expect, it } from "vitest"

describe("Entity model valitation", () => {
  it.each([
    [
      {
        schema: {
          id: "string",
          name: "string",
        },
        methods: {},
        relations: [],
      },
      true,
    ],
    [
      {
        schema: {
          id: "string",
          name: "string",
        },
        methods: {
          methodA: () => {},
        },
        relations: [],
      },
      true,
    ],
    [
      {
        schema: {
          id: "string",
          name: "string",
        },
        methods: {
          name: () => "string",
        },
        relations: [],
      },
      false,
    ],
    [
      {
        schema: {
          id: "string",
          name: "string",
        },
        methods: {
          methodB: () => "string",
        },
        relations: [
          {
            id: "relationA",
          },
        ],
      },
      true,
    ],
    [
      {
        schema: {
          id: "string",
          name: "string",
        },
        methods: {
          methodB: () => "string",
        },
        relations: [
          {
            id: "name",
          },
        ],
      },
      false,
    ],
    [
      {
        schema: {
          id: "string",
          name: "string",
        },
        methods: {
          relationC: () => "string",
        },
        relations: [
          {
            id: "relationC",
          },
        ],
      },
      false,
    ],
  ])("should validate input", ({ schema, methods, relations }, successful) => {
    if (successful) {
      expect(() =>
        validateInput(schema, methods, relations as any)
      ).not.toThrow()
    } else {
      expect(() => validateInput(schema, methods, relations as any)).toThrow()
    }
  })
})
