import { Effect, HashMap, Ref, Tuple } from "effect";

import { Todo, TodoId, TodoNotFound } from "@/domain";

export class TodoRepository extends Effect.Service<TodoRepository>()("backend/TodoRepository", {
    effect: Effect.gen(function* () {
        const todos = yield* Ref.make(
            HashMap.make(
                Tuple.make(TodoId.make(1), new Todo({ id: TodoId.make(1), title: "Some Todo", completed: false })),
                Tuple.make(TodoId.make(2), new Todo({ id: TodoId.make(2), title: "Another Todo", completed: true })),
            ),
        );

        const getAll = Ref.get(todos).pipe(Effect.map((todos) => Array.from(HashMap.values(todos))));

        function getById(id: TodoId): Effect.Effect<Todo, TodoNotFound> {
            return Ref.get(todos).pipe(
                Effect.flatMap(HashMap.get(id)),
                Effect.catchTag("NoSuchElementException", () => new TodoNotFound({ id })),
            );
        }

        function create(title: string): Effect.Effect<Todo> {
            return Ref.modify(todos, (map) => {
                const id = TodoId.make(HashMap.reduce(map, -1, (max, todo) => (todo.id > max ? todo.id : max)) + 1);
                const todo = new Todo({ id, title, completed: false });
                return [todo, HashMap.set(map, id, todo)];
            });
        }

        function updateCompleted(id: TodoId, completed: boolean): Effect.Effect<Todo, TodoNotFound> {
            return getById(id).pipe(
                Effect.map((todo) => new Todo({ ...todo, completed })),
                Effect.tap((todo) => Ref.update(todos, HashMap.set(todo.id, todo))),
            );
        }

        function updateTitle(id: TodoId, title: string): Effect.Effect<Todo, TodoNotFound> {
            return getById(id).pipe(
                Effect.map((todo) => new Todo({ ...todo, title })),
                Effect.tap((todo) => Ref.update(todos, HashMap.set(todo.id, todo))),
            );
        }

        function remove(id: TodoId): Effect.Effect<void, TodoNotFound> {
            return getById(id).pipe(Effect.flatMap((todo) => Ref.update(todos, HashMap.remove(todo.id))));
        }

        return {
            getAll,
            getById,
            create,
            updateCompleted,
            updateTitle,
            remove,
        } as const;
    }),
}) {}
