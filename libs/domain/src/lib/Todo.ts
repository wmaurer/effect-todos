import { Schema } from "effect"

export const TodoId = Schema.Number.pipe(Schema.brand("TodoId"))
export type TodoId = typeof TodoId.Type

export const TodoIdFromString = Schema.NumberFromString.pipe(Schema.compose(TodoId))

export class Todo extends Schema.Class<Todo>("Todo")({
    id: TodoId,
    title: Schema.NonEmptyTrimmedString,
    completed: Schema.Boolean,
}) {}

export class TodoNotFound extends Schema.TaggedError<TodoNotFound>()("TodoNotFound", {
    id: Schema.Number,
}) {}
