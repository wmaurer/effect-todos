import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"

import { Todo, TodoIdFromString, TodoNotFound } from "./Todo"

export class TodoApiGroup extends HttpApiGroup.make("todos")
    .add(HttpApiEndpoint.get("getAllTodos", "/todos").addSuccess(Schema.Array(Todo)))
    .add(
        HttpApiEndpoint.get("getTodoById", "/todos/:id")
            .addSuccess(Todo)
            .addError(TodoNotFound, { status: 404 })
            .setPath(Schema.Struct({ id: TodoIdFromString })),
    )
    .add(HttpApiEndpoint.post("createTodo", "/todos").addSuccess(Todo).setPayload(Schema.NonEmptyTrimmedString))
    .add(
        HttpApiEndpoint.patch("updateTodoCompleted", "/todos/:id/updateCompleted")
            .addSuccess(Todo)
            .addError(TodoNotFound, { status: 404 })
            .setPath(Schema.Struct({ id: TodoIdFromString }))
            .setPayload(Schema.Boolean),
    )
    .add(
        HttpApiEndpoint.patch("updateTodoTitle", "/todos/:id/updateTitle")
            .addSuccess(Todo)
            .addError(TodoNotFound, { status: 404 })
            .setPath(Schema.Struct({ id: TodoIdFromString }))
            .setPayload(Schema.NonEmptyTrimmedString),
    )
    .add(
        HttpApiEndpoint.del("removeTodo", "/todos/:id")
            .addSuccess(Schema.Void)
            .addError(TodoNotFound, { status: 404 })
            .setPath(Schema.Struct({ id: TodoIdFromString })),
    ) {}

export class Api extends HttpApi.make("api").add(TodoApiGroup).add(TodoApiGroup) {}
