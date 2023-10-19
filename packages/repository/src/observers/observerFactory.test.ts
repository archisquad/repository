/* eslint-disable sonarjs/no-duplicate-string */
// @vitest-environment jsdom
import { observerFactory } from "./observerFactory"
import { Observer } from "./types"
import { describe, expect, expectTypeOf, it, vi } from "vitest"

describe("ObserverFactory", () => {
  describe("Interface", () => {
    it("Given factory, When create, Then return trigger & observe functions", () => {
      const { trigger, observe } = observerFactory()

      expect(trigger).toBeInstanceOf(Function)
      expect(observe).toBeInstanceOf(Function)
    })

    it("Given factory, When create, Then create a new set of trigger & observe functions", () => {
      const { trigger, observe } = observerFactory()
      const { trigger: trigger2, observe: observe2 } = observerFactory()

      expect(trigger).not.toBe(trigger2)
      expect(observe).not.toBe(observe2)
    })

    describe("observe()", () => {
      it("Given factory, When create without actions, Then observe() can create one subscription without name", () => {
        const { observe } = observerFactory()

        expectTypeOf(observe).parameter(0).toBeFunction()
      })

      it("Given factory, When create with actions, Then observe() can create many subscription with a given action names", () => {
        const { observe } = observerFactory({ actions: ["action1", "action2"] })

        expectTypeOf(observe).parameter(0).toMatchTypeOf<{
          action: "action1" | "action2"
          observer: Observer
          idle?: boolean
        }>()
      })

      it("Given factory, When create without actions with data accessor, Then observe() can create one subscription without name but with data injected", () => {
        const { observe } = observerFactory({
          dataAccessor: () => ({ foo: "bar" }),
        })

        expectTypeOf(observe).parameter(0).toMatchTypeOf<{
          (data: { foo: string }): void
        }>()
      })
    })

    describe("trigger()", () => {
      it("Given factory, When create without actions, Then trigger() can trigger one subscription without name", () => {
        const { trigger, observe } = observerFactory()
        const callback = vi.fn()

        observe(callback)
        trigger()

        expect(callback).toBeCalledTimes(1)
      })

      it("Given factory, When create with actions, Then trigger() can trigger many subscription with a given action names", () => {
        const { trigger, observe } = observerFactory({
          actions: ["action1", "action2"],
        })
        const callback1 = vi.fn()
        const callback2 = vi.fn()

        observe(
          { action: "action1", observer: callback1 },
          { action: "action2", observer: callback2 }
        )
        trigger("action1")
        trigger("action2")

        expect(callback1).toBeCalledTimes(1)
        expect(callback2).toBeCalledTimes(1)
      })
    })
  })

  describe("Implementation", () => {
    it("Given callback, When trigger, Then run it synchronously", () => {
      const { trigger, observe } = observerFactory()
      const callback = vi.fn()

      observe(callback)
      trigger()

      expect(callback).toBeCalledTimes(1)
    })

    it("Given async callback, When trigger, Then run it as Promise", () => {
      const { trigger, observe } = observerFactory()
      const counter = { value: 0 }
      const callback = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          counter.value += 1
          resolve(counter.value)
        })
      })

      observe(callback)
      trigger()

      expect(callback).toBeCalledTimes(1)
      expect(counter.value).toBe(1)
    })

    it("Given callback with idle option, When trigger, Then run when browser is idle", () => {
      vi.stubGlobal("requestIdleCallback", (callback: () => void) => {
        callback()
      })

      const { trigger, observe } = observerFactory({
        actions: ["action-idle"],
      })
      const callback = vi.fn()

      observe({ action: "action-idle", observer: callback, idle: true })
      trigger("action-idle")

      expect(callback).toBeCalledTimes(1)
    })

    it("Given callback with idle option on non-supported browser, When trigger, Then run after 2000ms", () => {
      vi.useFakeTimers()
      // eslint-disable-next-line unicorn/no-useless-undefined
      vi.stubGlobal("requestIdleCallback", undefined)
      const { trigger, observe } = observerFactory({
        actions: ["action-idle"],
      })
      const callback = vi.fn()

      observe({ action: "action-idle", observer: callback, idle: true })
      trigger("action-idle")

      expect(callback).toBeCalledTimes(0)

      vi.advanceTimersByTime(2000)

      expect(callback).toBeCalledTimes(1)
    })

    it("Given data access function, When callback triggered, Then callback has access to data", () => {
      const { trigger, observe } = observerFactory({
        dataAccessor: () => ({ foo: "bar" }),
      })
      const callback = vi.fn()

      observe(callback)
      trigger()

      expect(callback).toBeCalledTimes(1)
      expect(callback).toBeCalledWith({ foo: "bar" })
    })
  })
})
