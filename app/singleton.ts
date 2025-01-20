/**
 * Create a singleton to maintain a single instance. Useful in development mode to avoid creating multiple instances on
 * hot reload during development.
 * @param name
 * @param valueFactory
 */
export const singleton = <Value>(name: string, valueFactory: () => Value): Value => {
  const g = global as unknown as { __singletons: Record<string, unknown> }
  g.__singletons ??= {}
  g.__singletons[name] ??= valueFactory()
  return g.__singletons[name] as Value
}
