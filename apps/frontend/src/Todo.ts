import { createId } from "@paralleldrive/cuid2"
import { Schema } from "effect"

import { TodoId } from "@/domain"

// export class ClientGeneratedId extends Schema.Class<ClientGeneratedId>("@/Frontend/ClientGeneratedId")({
//     id: Schema.String,
// }) {
//     static generate(): ClientGeneratedId {
//         return new ClientGeneratedId({ id: createId() })
//     }
// }

// export const ClientTodoId = Schema.Union(TodoId, ClientGeneratedId)
// export type ClientTodoId = typeof ClientTodoId.Type

// export const isClientGeneratedId = (id: ClientTodoId): id is ClientGeneratedId => Schema.is(ClientGeneratedId)(id)
// export const isServerTodoId = (id: ClientTodoId): id is TodoId => Schema.is(TodoId)(id)

// export class Todo extends Schema.Class<Todo>("Todo")({
//     id: ClientTodoId,
//     title: Schema.NonEmptyTrimmedString,
//     completed: Schema.Boolean,
// }) {}

export const TodosFilter = Schema.Literal("all", "active", "completed")
export type TodosFilter = typeof TodosFilter.Type
