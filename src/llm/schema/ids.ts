import { Schema } from "effect"

export const ProtocolID = Schema.String
export type ProtocolID = Schema.Schema.Type<typeof ProtocolID>

export const RouteID = Schema.String
export type RouteID = Schema.Schema.Type<typeof RouteID>

export const ModelID = Schema.String.pipe(Schema.brand("LLM.ModelID"))
export type ModelID = Schema.Schema.Type<typeof ModelID>
