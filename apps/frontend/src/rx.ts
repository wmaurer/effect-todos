import { FetchHttpClient, HttpApiClient, KeyValueStore } from "@effect/platform"
import { HttpApiDecodeError } from "@effect/platform/HttpApiError"
import { HttpClientError } from "@effect/platform/HttpClientError"
import { Result, Rx } from "@effect-rx/rx-react"
import { Array, Effect, HashMap, Layer, Match, Option, Schema, Stream, SubscriptionRef, Tuple, pipe } from "effect"
import { ParseError } from "effect/ParseResult"

import * as AsyncData from "./AsyncData"
import { TodosFilter } from "./Todo"

import { Api, Todo, TodoId, TodoNotFound } from "@/domain"

export class InternalApplicationError extends Schema.TaggedError<InternalApplicationError>()(
    "@/Frontend/InternalApplicationError",
    { message: Schema.String },
) {}

class TodoService extends Effect.Service<TodoService>()("TodosService", {
    accessors: true,
    effect: Effect.gen(function* () {
        const todosStore = (yield* KeyValueStore.KeyValueStore).forSchema(Schema.Array(Todo))
        const todosFilterStore = (yield* KeyValueStore.KeyValueStore).forSchema(TodosFilter)

        const map = (yield* todosStore.get("todos")).pipe(
            Option.map((products) => HashMap.make(...products.map((p) => Tuple.make(p.id, p)))),
            Option.getOrElse(() => HashMap.empty<TodoId, Todo>()),
        )
        const filter = (yield* todosFilterStore.get("todosFilter")).pipe(Option.getOrElse(() => TodosFilter.enums.all))

        const filteredTodos = Effect.sync(() =>
            Match.value(filter).pipe(
                Match.when("all", () => HashMap.values(map)),
                Match.when("active", () => Array.filter(HashMap.values(map), (t) => !t.completed)),
                Match.when("completed", () => Array.filter(HashMap.values(map), (t) => t.completed)),
                Match.exhaustive,
            ),
        )

        const incompleteTodosCount = HashMap.size(map)

        const getTodo = (id: TodoId) =>
            HashMap.get(map, id).pipe(
                Effect.catchTag(
                    "NoSuchElementException",
                    () => new InternalApplicationError({ message: `Todo with id ${id} not found` }),
                ),
            )

        const toggleTodo = Effect.fn("TodosService.toggleTodo")(function* (id: TodoId) {
            const todo = yield* getTodo(id)
            yield* todosStore.set(
                "todos",
                Array.fromIterable(HashMap.values(HashMap.set(map, id, { ...todo, completed: !todo.completed }))),
            )
        })

        // const fetchTodos = Effect.fn("TodosService.fetchTodos")(function* () {
        //     const result = yield* client.todos.getAllTodos().pipe(Effect.map(HashMap.toValues), Effect.either)
        //     yield* SubscriptionRef.update(adTodosRef, () => AsyncData.fromEither(result))
        // })

        // const updateTodo = (id: TodoId, f: (todo: Todo) => Todo) => (todos: ReadonlyArray<Todo>) =>
        //     Array.map(todos, (t) => (t.id === id ? f(t) : t))

        // const getTodo = (todos: ReadonlyArray<Todo>, id: TodoId) => map.get(id)
        // // map.get(todos, (t) => t.id === id).pipe(
        // //     Effect.catchTag(
        // //         "NoSuchElementException",
        // //         () => new InternalApplicationError({ message: `Todo with id ${id} not found` }),
        // //     ),
        // // )

        // const getAdTodosInSuccess = () =>
        //     SubscriptionRef.get(adTodosRef).pipe(
        //         Effect.filterOrElse(
        //             (adTodos) => AsyncData.isSuccess(adTodos),
        //             () => new InternalApplicationError({ message: "Optimisitic update should be in Success state" }),
        //         ),
        //     )

        // const getAdTodosInOptimistic = () =>
        //     SubscriptionRef.get(adTodosRef).pipe(
        //         Effect.filterOrElse(
        //             (adTodos) => AsyncData.isOptimistic(adTodos),
        //             () => new InternalApplicationError({ message: "Optimisitic update should be in Success state" }),
        //         ),
        //         Effect.map((adTodos) => adTodos.previous),
        //         Effect.filterOrElse(
        //             (adTodos) => AsyncData.isSuccess(adTodos),
        //             () => new InternalApplicationError({ message: "Optimisitic update should be in Success state" }),
        //         ),
        //     )

        // const updateOptimistic = (fn: (todos: ReadonlyArray<Todo>) => ReadonlyArray<Todo>) =>
        //     getAdTodosInSuccess().pipe(
        //         Effect.andThen((adTodos) =>
        //             SubscriptionRef.set(adTodosRef, AsyncData.optimistic(adTodos, fn(adTodos.value))),
        //         ),
        //     )

        // const updateSuccess = (fn: (todos: ReadonlyArray<Todo>) => ReadonlyArray<Todo>) =>
        //     getAdTodosInOptimistic().pipe(
        //         Effect.andThen((previousSuccess) =>
        //             SubscriptionRef.set(adTodosRef, AsyncData.success(fn(previousSuccess.value))),
        //         ),
        //     )

        // const toggleTodo = Effect.fn("TodosService.toggleTodo")(
        //     function* (id: TodoId) {
        //         const adTodos = yield* getAdTodosInSuccess()
        //         const todo = yield* getTodo(adTodos.value, id)
        //         const completed = !todo.completed

        //         yield* updateOptimistic(updateTodo(id, (t) => Todo.make({ ...t, completed })))
        //         const serverTodo = yield* client.todos.updateTodoCompleted({ path: { id }, payload: completed })
        //         yield* updateSuccess(updateTodo(id, () => serverTodo))
        //     },
        //     Effect.catchAllCause((e) => SubscriptionRef.set(adTodosRef, AsyncData.failure(e))),
        // )

        // const setTodosFilter = Effect.fn("TodosService.setTodosFilter")(
        //     function* (filter: TodosFilter) {
        //         const existingFilter = yield* SubscriptionRef.get(todosFilter)
        //         if (existingFilter === filter) return
        //         yield* SubscriptionRef.update(todosFilter, () => filter)
        //     },
        //     Effect.catchAllCause((e) => SubscriptionRef.set(adTodosRef, AsyncData.failure(e))),
        // )

        // const clearCompletedTodos = Effect.fn("TodosService.clearCompletedTodos")(
        //     function* () {
        //         const adTodos = yield* getAdTodosInSuccess()
        //         const completedTodoIds = pipe(
        //             Array.filter(adTodos.value, (t) => t.completed),
        //             Array.map((t) => t.id),
        //         )

        //         yield* updateOptimistic(Array.filter((t) => !t.completed))
        //         yield* Effect.all(Array.map(completedTodoIds, (id) => client.todos.removeTodo({ path: { id } })))
        //         yield* updateSuccess(Array.filter((t) => !t.completed))
        //     },
        //     Effect.catchAllCause((e) => SubscriptionRef.set(adTodosRef, AsyncData.failure(e))),
        // )

        // const createTodo = Effect.fn("TodosService.createTodo")(
        //     function* (title: string) {
        //         const todo = Todo.make({ id: TodoId.make(Number.MAX_SAFE_INTEGER), title, completed: false })
        //         yield* updateOptimistic(Array.append(todo))
        //         const serverTodo = yield* client.todos.createTodo({ payload: title })
        //         yield* updateSuccess(Array.append(serverTodo))
        //     },
        //     Effect.catchAllCause((e) => SubscriptionRef.set(adTodosRef, AsyncData.failure(e))),
        // )

        // const toggleAllTodos = Effect.fn("TodosService.toggleAllTodos")(
        //     function* (completed: boolean) {
        //         const { value: todos } = yield* getAdTodosInSuccess()
        //         const allTodoIds = Array.map(todos, (t) => t.id)

        //         yield* updateOptimistic(Array.map((t) => Todo.make({ ...t, completed })))
        //         yield* Effect.all(
        //             Array.map(allTodoIds, (id) =>
        //                 client.todos.updateTodoCompleted({ path: { id }, payload: completed }),
        //             ),
        //         )
        //         yield* updateSuccess(Array.map((t) => Todo.make({ ...t, completed })))
        //     },
        //     Effect.catchAllCause((e) => SubscriptionRef.set(adTodosRef, AsyncData.failure(e))),
        // )

        // const removeTodo = Effect.fn("TodosService.removeTodo")(
        //     function* (id: TodoId) {
        //         yield* updateOptimistic(Array.filter((t) => t.id !== id))
        //         yield* client.todos.removeTodo({ path: { id } })
        //         yield* updateSuccess(Array.filter((t) => t.id !== id))
        //     },
        //     Effect.catchAllCause((e) => SubscriptionRef.set(adTodosRef, AsyncData.failure(e))),
        // )

        // const updateTodoTitle = Effect.fn("TodosService.updateTodoTitle")(
        //     function* (id: TodoId, title: string) {
        //         yield* updateOptimistic(updateTodo(id, (t) => Todo.make({ ...t, title })))
        //         const serverTodo = yield* client.todos.updateTodoTitle({ path: { id }, payload: title })
        //         yield* updateSuccess(updateTodo(id, () => serverTodo))
        //     },
        //     Effect.catchAllCause((e) => SubscriptionRef.set(adTodosRef, AsyncData.failure(e))),
        // )

        // yield* fetchTodos()

        return {
            todos: filteredTodos,
            incompleteTodosCount,
            // clearCompletedTodos,
            toggleTodo,
            // setTodosFilter,
            // createTodo,
            // toggleAllTodos,
            // removeTodo,
            // updateTodoTitle,
        } as const
    }),
}) {}

const runtimeRx = Rx.runtime(TodoService.Default.pipe(Layer.provide(FetchHttpClient.layer)))

export const todosRx = runtimeRx.rx(TodoService.todos.pipe(Stream.unwrap)).pipe(Rx.keepAlive)

export const incompleteTodosCountRx = runtimeRx
    .rx(TodoService.incompleteTodosCount.pipe(Stream.unwrap))
    .pipe(Rx.map(Result.getOrElse(() => 0)))

export const callTodosServiceFn = runtimeRx
    .fn(
        Effect.fnUntraced(function* (fn: (todosService: TodoService) => Effect.Effect<void>) {
            yield* TodoService.pipe(Effect.andThen(fn))
        }),
    )
    .pipe(Rx.keepAlive)
