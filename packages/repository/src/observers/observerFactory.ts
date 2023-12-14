import { Observatory } from "./observatory"

export function observerFactory<
  const TActions extends readonly string[] = [],
  TDataAccessor = never,
>(
  config: {
    actions?: TActions
    dataAccessor?: () => TDataAccessor
  } = {}
) {
  const internal = new Observatory(config)

  return {
    internal,
    trigger: internal.trigger.bind(internal),
    observe: internal.observe.bind(internal),
  }
}
