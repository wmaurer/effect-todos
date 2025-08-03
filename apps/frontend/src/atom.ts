import { FetchHttpClient } from "@effect/platform";
import { Atom, AtomHttpApi, Registry, Result } from "@effect-atom/atom-react";
import { Array, Data, Effect, Either, Match, Option } from "effect";
import { NoSuchElementException } from "effect/Cause";

import { upsertBy } from "./array";
import { TodosFilter } from "./Todo";

import { Api, Todo, TodoId } from "@/domain";

export class ApiClient extends AtomHttpApi.Tag<ApiClient>()("ApiClient", {
    api: Api,
    httpClient: FetchHttpClient.layer,
    baseUrl: "http://localhost:3000",
}) {}

const runtime = Atom.runtime(ApiClient.layer);

type TodosAtomResultError = UpdateTodoCompletedError | UpdateTodoTitleError | RemoveTodoError | CreateTodoError;

const todosAtom = runtime.atom(ApiClient.pipe(Effect.flatMap((api) => api.todos.getAllTodos())));

export const todosOperationErrorAtom = Atom.make(Option.none<TodosAtomResultError>());
export const todosOperationPendingAtom = Atom.make(false);

type Action = Data.TaggedEnum<{
    ReplaceAll: { readonly todos: ReadonlyArray<Todo> };
    Upsert: { readonly todo: Todo };
    Del: { readonly id: TodoId };
}>;
const Action = Data.taggedEnum<Action>();

export const writableTodosAtom = Atom.writable(
    (get) => get(todosAtom),
    (ctx, action: Action) => {
        const todos = ctx.get(writableTodosAtom);
        if (!Result.isSuccess(todos)) return;

        ctx.setSelf(
            Action.$match(action, {
                ReplaceAll: (a) => Result.success(a.todos),
                Upsert: (a) => Result.success(upsertBy(todos.value, (t) => t.id === a.todo.id, a.todo)),
                Del: (a) => Result.success(Array.filter(todos.value, (t) => t.id !== a.id)),
            }),
        );
    },
);

export const todosFilterAtom = Atom.make<TodosFilter>("all");

export const filteredTodosAtom = Atom.make((get) => {
    const filter = get(todosFilterAtom);
    const allTodos = get(writableTodosAtom);

    return Result.map(allTodos, (todos) =>
        Match.value(filter).pipe(
            Match.when("all", () => todos),
            Match.when("active", () => Array.filter(todos, (t) => !t.completed)),
            Match.when("completed", () => Array.filter(todos, (t) => t.completed)),
            Match.exhaustive,
        ),
    );
});

export const incompleteTodosCountAtom = Atom.map(writableTodosAtom, (todos) =>
    Result.map(todos, (ts) => Array.filter(ts, (t) => !t.completed).length),
);

const makeUpdateTodosAtom = (
    fn: (todos: ReadonlyArray<Todo>, api: typeof ApiClient.Service) => Effect.Effect<Action, TodosAtomResultError>,
) =>
    Effect.gen(function* () {
        const registry = yield* Registry.AtomRegistry;
        registry.set(todosOperationPendingAtom, true);
        const api = yield* ApiClient;
        const existingTodos = registry.get(writableTodosAtom);
        if (!Result.isSuccess(existingTodos)) return;
        const result = yield* fn(existingTodos.value, api).pipe(Effect.either);
        if (Either.isLeft(result)) {
            registry.set(todosOperationErrorAtom, Option.some(result.left));
        } else {
            registry.set(todosOperationErrorAtom, Option.none());
            registry.set(writableTodosAtom, result.right);
        }
        registry.set(todosOperationPendingAtom, false);
    });

export class UpdateTodoCompletedError extends Data.TaggedError("UpdateTodoCompletedError")<{
    id: TodoId;
    cause: Effect.Effect.Error<ReturnType<typeof ApiClient.Service.todos.updateTodoCompleted>> | NoSuchElementException;
}> {}

export const toggleTodoAtom = runtime.fn(
    Effect.fn(function* (id: TodoId) {
        yield* makeUpdateTodosAtom((todos, api) =>
            Effect.gen(function* () {
                const existingTodo = yield* Array.findFirst(todos, (t) => t.id === id);
                const todo = yield* api.todos.updateTodoCompleted({
                    path: { id: id },
                    payload: !existingTodo.completed,
                });
                return Action.Upsert({ todo });
            }).pipe(Effect.mapError((cause) => new UpdateTodoCompletedError({ id, cause }))),
        );
    }),
);

export const toggleAllTodosAtom = runtime.fn(
    Effect.fn(function* (completed: boolean) {
        yield* makeUpdateTodosAtom((existingTodos, api) =>
            Effect.gen(function* () {
                const todos = yield* Effect.all(
                    Array.map(existingTodos, (a) =>
                        api.todos
                            .updateTodoCompleted({ path: { id: a.id }, payload: completed })
                            .pipe(Effect.mapError((cause) => new UpdateTodoCompletedError({ id: a.id, cause }))),
                    ),
                );
                return Action.ReplaceAll({ todos });
            }),
        );
    }),
);

export class RemoveTodoError extends Data.TaggedError("RemoveTodoError")<{
    id: TodoId;
    cause: Effect.Effect.Error<ReturnType<typeof ApiClient.Service.todos.removeTodo>>;
}> {}

export const removeTodoAtom = runtime.fn(
    Effect.fn(function* (id: TodoId) {
        yield* makeUpdateTodosAtom((_, api) =>
            api.todos.removeTodo({ path: { id } }).pipe(
                Effect.map(() => Action.Del({ id })),
                Effect.mapError((cause) => new RemoveTodoError({ id, cause })),
            ),
        );
    }),
);

export class CreateTodoError extends Data.TaggedError("CreateTodoError")<{
    title: string;
    cause: Effect.Effect.Error<ReturnType<typeof ApiClient.Service.todos.createTodo>>;
}> {}

export const createTodoAtom = runtime.fn(
    Effect.fn(function* (title: string) {
        yield* makeUpdateTodosAtom((_, api) =>
            api.todos.createTodo({ payload: title }).pipe(
                Effect.map((todo) => Action.Upsert({ todo })),
                Effect.mapError((cause) => new CreateTodoError({ title, cause })),
            ),
        );
    }),
);

export class UpdateTodoTitleError extends Data.TaggedError("UpdateTodoTitleError")<{
    id: TodoId;
    title: string;
    cause: Effect.Effect.Error<ReturnType<typeof ApiClient.Service.todos.updateTodoTitle>>;
}> {}

export const updateTodoTitleAtom = runtime.fn(
    Effect.fn(function* ({ id, title }: { id: TodoId; title: string }) {
        yield* makeUpdateTodosAtom((_, api) =>
            api.todos.updateTodoTitle({ path: { id }, payload: title }).pipe(
                Effect.map((todo) => Action.Upsert({ todo })),
                Effect.mapError((cause) => new UpdateTodoTitleError({ id, title, cause })),
            ),
        );
    }),
);

export const clearCompletedTodosAtom = runtime.fn(
    Effect.fn(function* () {
        yield* makeUpdateTodosAtom((existingTodos, api) =>
            Effect.gen(function* () {
                const completedTodos = Array.filter(existingTodos, (t) => t.completed);
                yield* Effect.all(
                    Array.map(completedTodos, (a) =>
                        api.todos
                            .removeTodo({ path: { id: a.id } })
                            .pipe(Effect.mapError((cause) => new RemoveTodoError({ id: a.id, cause }))),
                    ),
                );
                return Action.ReplaceAll({ todos: Array.filter(existingTodos, (t) => !t.completed) });
            }),
        );
    }),
);
