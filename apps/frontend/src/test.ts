import { Array, Effect, Either, Match, Queue, Schema, Sink, Stream, SubscriptionRef, Take } from "effect"

export class Todo extends Schema.Class<Todo>("Todo")({
    id: Schema.Number,
    title: Schema.NonEmptyTrimmedString,
    completed: Schema.Boolean,
}) {}

type Filter = "all" | "active" | "completed"

const program = Effect.gen(function* () {
    const todosStream = Stream.make(
        Either.right([
            Todo.make({ id: 1, title: "Todo 1", completed: false }),
            Todo.make({ id: 2, title: "Todo 2", completed: true }),
            Todo.make({ id: 3, title: "Todo 3", completed: true }),
        ]),
    )

    const filter = yield* SubscriptionRef.make<Filter>("all")
    const output = yield* Queue.bounded<Take.Take<number>>(1)

    yield* Stream.zipLatest(todosStream, filter.changes).pipe(
        Stream.map(([adTodos, filter]) =>
            Either.match(adTodos, {
                onLeft: () => 0,
                onRight: (todos) => {
                    return Match.value(filter).pipe(
                        Match.when("all", () => todos.length),
                        Match.when("active", () => Array.filter(todos, (t) => !t.completed).length),
                        Match.when("completed", () => Array.filter(todos, (t) => t.completed).length),
                        Match.exhaustive,
                    )
                },
            }),
        ),
        Stream.runIntoQueue(output),
        Effect.fork,
    )

    yield* SubscriptionRef.set(filter, "active")
    console.log("ccc")

    const foo = yield* Queue.takeN(output, 1)
    console.log("foo", foo)
    // const foo = yield* filteredTodos().pipe(Stream.run(Sink.last()))
    // yield* SubscriptionRef.set(filter, "active")
    // console.log(foo)
    // // yield* Stream.unfoldEffect(makeFilteredTodos(), Effect.log)
    // // yield* Stream.runForEach(makeFilteredTodos(), (adTodos) => Effect.log(Either.getOrElse(adTodos, () => []).length))

    // console.log("aaa")
    // const bar = yield* todosStream.pipe(Stream.run(Sink.last()))
    // console.log(bar)

    // // yield* SubscriptionRef.set(filter, "completed")

    // console.log("bbb")
    // // yield* Stream.runForEach(makeFilteredTodos(), (adTodos) => Effect.log(Either.getOrElse(adTodos, () => []).length))
})

program.pipe(Effect.runPromiseExit).then(console.log)
