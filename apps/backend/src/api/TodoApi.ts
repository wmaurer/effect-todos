import { HttpApiBuilder } from "@effect/platform";
import { Effect } from "effect";

import { TodoRepository } from "../TodoRepository";

import { Api } from "@/domain";

export const TodoApiLive = HttpApiBuilder.group(Api, "todos", (handlers) =>
    Effect.gen(function* () {
        const todos = yield* TodoRepository;
        return handlers
            .handle("getAllTodos", () => todos.getAll)
            .handle("getTodoById", ({ path: { id } }) => todos.getById(id))
            .handle("createTodo", ({ payload: text }) => todos.create(text))
            .handle("updateTodoCompleted", ({ path: { id }, payload: completed }) =>
                todos.updateCompleted(id, completed),
            )
            .handle("updateTodoTitle", ({ path: { id }, payload: title }) => todos.updateTitle(id, title))
            .handle("removeTodo", ({ path: { id } }) => todos.remove(id));
    }),
);
