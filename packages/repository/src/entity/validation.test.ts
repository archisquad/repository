import { describe, expect, it } from "vitest"
import { validateConfigObj } from "./validation"

function makeTestObj(
  {
    schema,
    methods,
    relations,
    identifier,
  }: Partial<{
    schema: Record<string, any>
    methods: Record<string, any>
    relations: Record<string, any>
    identifier: string | ((data: any) => any)
  }> = { schema: {}, methods: {}, relations: {}, identifier: "id" }
) {
  return {
    schema: {
      id: "string",
      name: "string",
      ...schema,
    },
    inferSchema: (data: any) => data,
    methods,
    relations,
    identifier,
  }
}

describe("Entity model valitation", () => {
  it.each([
    [makeTestObj(), true],
    [makeTestObj({ methods: { methodA: () => {} } }), true],
    [makeTestObj({ methods: { name: () => "string" } }), false],
    [
      makeTestObj({
        methods: { methodB: () => "string" },
        relations: { relationA: {} },
      }),
      true,
    ],
    [
      makeTestObj({
        methods: { methodB: () => "string" },
        relations: { name: {} },
      }),
      false,
    ],
    [
      makeTestObj({
        methods: { relationC: () => "string" },
        relations: { relationC: {} },
      }),
      false,
    ],
    [makeTestObj({ identifier: "foo" }), false],
    [makeTestObj({ identifier: (data: any) => data.id }), true],
  ])("should validate input", (config, successful) => {
    if (successful) {
      expect(() => validateConfigObj(config)).not.toThrow()
    } else {
      expect(() => validateConfigObj(config)).toThrow()
    }
  })
})
