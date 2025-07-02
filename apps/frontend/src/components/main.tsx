import { useRxSetPromise, useRxSuspenseSuccess } from "@effect-rx/rx-react"
import { Array, Cause } from "effect"

import * as AsyncData from "../AsyncData"
import { callTodosServiceFn, todosRx } from "../rx"

import { Item } from "./item"

export const Main = () => {
    const result = useRxSuspenseSuccess(todosRx)
    const callTodoServiceFn = useRxSetPromise(callTodosServiceFn)

    return AsyncData.match(result.value, {
        NoData: () => <div>Loading...</div>,
        Loading: () => <div>Loading...</div>,
        Success: (todos) => (
            <section className="main">
                <input
                    className="toggle-all"
                    type="checkbox"
                    id="toggle-all"
                    checked={Array.every(todos, (todo) => todo.completed)}
                    onChange={(e) => callTodoServiceFn((_) => _.toggleAllTodos(e.target.checked))}
                />
                <label htmlFor="toggle-all">Mark all as complete</label>
                <ul className="todo-list">
                    {Array.map(todos, (todo) => (
                        <Item todo={todo} key={todo.id} />
                    ))}
                </ul>
            </section>
        ),
        Failure: (e) => <div>{Cause.pretty(e)}</div>,
    })
}
