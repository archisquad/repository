import { Observer } from "./types"

const internalSlot = Symbol("internalSlot")

type ObserverDefinition<TActions, TInjectedData = any> = {
  action: TActions
  observer: Observer<TInjectedData>
} & Partial<ObserverOptions>

type ObserverOptions = {
  idle: boolean
}

/**
 * A class that allows you to observe changes to data.
 *
 * @template TActions - An array of strings representing the actions that can be observed.
 * @template TData - The type of data that can be observed.
 */
export class Observatory<
  const TActions extends readonly string[] = [],
  TData = never,
> {
  /**
   * A map of observers, keyed by action name or an internal slot.
   */
  private _observers: Map<
    string | typeof internalSlot,
    Set<Omit<ObserverDefinition<TActions, TData>, "action">>
  >

  /**
   * A function that returns the current data to be observed.
   */
  private _dataAccessor?: () => TData

  /**
   * Creates a new instance of the `Observatory` class.
   *
   * @param config - An object containing configuration options for the `Observatory` instance.
   * @param config.actions - An array of strings representing the actions that can be observed.
   * @param config.dataAccessor - A function that returns the current data to be observed.
   */
  public constructor(
    config: {
      actions?: TActions
      dataAccessor?: () => TData
    } = {}
  ) {
    this._observers = new Map()

    const { actions, dataAccessor } = config

    if (actions) {
      actions.forEach((action) => {
        this._observers.set(action, new Set())
      })
    }

    this._observers.set(internalSlot, new Set())

    this._dataAccessor = dataAccessor
  }

  /**
   * Adds an observer to the `Observatory` instance.
   *
   * @param args - An array of `ObserverDefinition` objects, each representing an observer to be added.
   * @param args[].action - The name of the action to observe.
   * @param args[].observer - The observer function to be called when the action is triggered.
   * @param args[].idle - A boolean indicating whether the observer should be called immediately upon being added.
   * @param args - An array containing a single observer function to be added. This is used when no actions are specified.
   */
  public observe(
    ...args: TActions["length"] extends 0
      ? [observer: Observer<TData>]
      : [...observers: ObserverDefinition<TActions[number]>[]]
  ): void {
    if (isArgsAnObserver<TData>(args)) {
      this._observers.get(internalSlot)?.add({
        observer: args[0],
      })
      return
    }

    args.forEach((definition) => {
      this._observers.get(definition.action)?.add(definition)
    })
  }

  /**
   * Triggers an action, calling all observers that are registered for that action.
   *
   * @param action - The name of the action to trigger.
   */
  public trigger(
    ...args: TActions["length"] extends 0 ? [] : [name: TActions[number]]
  ): void {
    const actionName = args[0] ?? internalSlot

    this._callObserver(this._observers.get(actionName) ?? new Set())
  }

  private _callObserver(
    definitionSet: Set<Omit<ObserverDefinition<TActions, TData>, "action">>
  ): void {
    const data = this._dataAccessor?.() ?? undefined

    definitionSet.forEach((definition) => {
      if (!definition.idle) {
        definition.observer(data)
        return
      }

      if (typeof window !== "undefined" && window?.requestIdleCallback) {
        window.requestIdleCallback(() => definition.observer(data))
        return
      }

      setTimeout(() => {
        definition.observer(data)
      }, 2000)
    })
  }
}

function isArgsAnObserver<TAccessor>(
  args: unknown[]
): args is [observer: Observer<TAccessor>] {
  return args.length === 1 && typeof args[0] === "function"
}
