import { Schema } from "effect"
import { isRecord } from "../utils/record"
import { JsonSchema } from "./ids"

export const mergeJsonRecords = (
  ...items: ReadonlyArray<Record<string, unknown> | undefined>
): Record<string, unknown> | undefined => {
  const defined = items.filter((item): item is Record<string, unknown> => item !== undefined)
  if (defined.length === 0) return undefined
  if (defined.length === 1 && Object.values(defined[0]).every(value => value !== undefined))
    return defined[0]
  const result: Record<string, unknown> = {}
  for (const item of defined) {
    for (const [key, value] of Object.entries(item)) {
      if (value === undefined) continue
      result[key] =
        isRecord(result[key]) && isRecord(value) ? mergeJsonRecords(result[key], value) : value
    }
  }
  return Object.keys(result).length === 0 ? undefined : result
}

const mergeStringRecords = (
  ...items: ReadonlyArray<Record<string, string> | undefined>
): Record<string, string> | undefined => {
  const defined = items.filter((item): item is Record<string, string> => item !== undefined)
  if (defined.length === 0) return undefined
  if (defined.length === 1) return defined[0]
  const result = Object.fromEntries(
    defined.flatMap(item =>
      Object.entries(item).filter((entry): entry is [string, string] => entry[1] !== undefined)
    )
  )
  return Object.keys(result).length === 0 ? undefined : result
}

export const ProviderOptions = Schema.Record(
  Schema.String,
  Schema.Record(Schema.String, Schema.Unknown)
)
export type ProviderOptions = Schema.Schema.Type<typeof ProviderOptions>

export const mergeProviderOptions = (
  ...items: ReadonlyArray<ProviderOptions | undefined>
): ProviderOptions | undefined => {
  const result: Record<string, Record<string, unknown>> = {}
  for (const item of items) {
    if (!item) continue
    for (const [provider, options] of Object.entries(item)) {
      const merged = mergeJsonRecords(result[provider], options)
      if (merged) result[provider] = merged
    }
  }
  return Object.keys(result).length === 0 ? undefined : result
}

export class HttpOptions extends Schema.Class<HttpOptions>("LLM.HttpOptions")({
  body: Schema.optional(JsonSchema),
  headers: Schema.optional(Schema.Record(Schema.String, Schema.String)),
  query: Schema.optional(Schema.Record(Schema.String, Schema.String))
}) {}

export namespace HttpOptions {
  export type Input = HttpOptions | ConstructorParameters<typeof HttpOptions>[0]

  export const make = (input: Input) =>
    input instanceof HttpOptions ? input : new HttpOptions(input)
}

export const mergeHttpOptions = (
  ...items: ReadonlyArray<HttpOptions | undefined>
): HttpOptions | undefined => {
  const body = mergeJsonRecords(...items.map(item => item?.body))
  const headers = mergeStringRecords(...items.map(item => item?.headers))
  const query = mergeStringRecords(...items.map(item => item?.query))
  if (!body && !headers && !query) return undefined
  return new HttpOptions({ body, headers, query })
}
