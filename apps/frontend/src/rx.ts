import { FetchHttpClient, HttpApiClient } from "@effect/platform"
import { Atom, AtomHttpApi, Result } from "@effect-atom/atom-react"
import { Array, Effect, HashMap, Match, Schema, Stream, SubscriptionRef } from "effect"

import { TodosFilter } from "./Todo"

import { Api, Todo, TodoId } from "@/domain"

export class InternalApplicationError extends Schema.TaggedError<InternalApplicationError>()(
    "@/Frontend/InternalApplicationError",
    { message: Schema.String },
) {}

export class TodoService extends Effect.Service<TodoService>()("TodosService", {
    accessors: true,
    effect: Effect.gen(function* () {
        yield* Effect.succeed(1)

        const todos = HashMap.empty<TodoId, Todo>()
        const todos2 = Result.initial<HashMap.HashMap<TodoId, Todo>>()

        return {
            todos: Effect.sync(() => todos),
            todos2: Effect.sync(() => todos2),
        } as const
    }),
}) {}
const runtimeAtom = Atom.runtime(TodoService.Default)
export const todosAtomReadonly = runtimeAtom.atom(TodoService.todos).pipe(Atom.map(Result.getOrElse(Array.empty<Todo>)))
export const todosAtom = Atom.optimistic(todosAtomReadonly)
export const todosAtom2Readonly = runtimeAtom
    .atom(TodoService.todos2)
    .pipe(Atom.map(Result.getOrElse(Array.empty<Todo>)))
export const todosAtom2 = Atom.optimistic(todosAtom2Readonly)

export class ApiClient extends AtomHttpApi.Tag<ApiClient>()("ApiClient", {
    api: Api,
    httpClient: FetchHttpClient.layer,
    baseUrl: "http://localhost:3000",
}) {}

export const allTodosAtomReadonly = ApiClient.query("todos", "getAllTodos", {})
export const allTodosAtom = Atom.optimistic(allTodosAtomReadonly.pipe(Atom.map(Result.getOrElse(Array.empty<Todo>))))
export const todosFilterAtom = Atom.make<TodosFilter>("all")

export const filteredTodosAtom = Atom.make((get) => {
    const filter = get(todosFilterAtom)
    const allTodos = get(allTodosAtom)

    return Match.value(filter).pipe(
        Match.when("all", () => allTodos),
        Match.when("active", () => Array.filter(allTodos, (t) => !t.completed)),
        Match.when("completed", () => Array.filter(allTodos, (t) => t.completed)),
        Match.exhaustive,
    )
})

export const incompleteTodosCountAtom = Atom.map(
    allTodosAtom,
    (todos) => Array.filter(todos, (t) => !t.completed).length,
)

export const toggleTodoAtom = Atom.optimisticFn(allTodosAtom, {
    reducer: (todos, _: { id: TodoId; completed: boolean }) =>
        todos.map((todo) => (todo.id === _.id ? { ...todo, completed: _.completed } : todo)),
    fn: ApiClient.runtime.fn(({ id, completed }) =>
        ApiClient.pipe(Effect.andThen((_) => _.todos.updateTodoCompleted({ path: { id }, payload: completed }))),
    ),
})
