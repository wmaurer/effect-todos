import { Result, useRxSetPromise, useRxSuspenseSuccess, useRxValue } from "@effect-rx/rx-react"
import { Array } from "effect"

import { callTodosServiceFn, todosRx } from "../rx"

import { Item } from "./item"

export const Main = () => {
    const result = useRxValue(
        todosRx,
        Result.getOrElse(() => []),
    )
    const callTodoServiceFn = useRxSetPromise(callTodosServiceFn)

    return (
        // <div>hello</div>
        <section className="main">
            <input
                className="toggle-all"
                type="checkbox"
                id="toggle-all"
                checked={Array.every(result, (todo) => todo.completed)}
                onChange={(e) => callTodoServiceFn((_) => _.toggleAllTodos(e.target.checked))}
            />
            <label htmlFor="toggle-all">Mark all as complete</label>
            <ul className="todo-list">
                {Array.map(result, (todo) => (
                    // <Item todo={todo} key={todo.id} />
                    <button key={todo.id} onClick={() => callTodoServiceFn((_) => _.toggleTodo(todo.id))}>
                        {JSON.stringify(todo)}
                    </button>
                ))}
            </ul>
        </section>
    )
}
