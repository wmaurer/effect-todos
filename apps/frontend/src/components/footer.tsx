import { useRxSetPromise, useRxValue } from "@effect-rx/rx-react"
import { Link } from "@tanstack/react-router"

import { callTodosServiceFn, incompleteTodosCountRx } from "../rx"

export const Footer = () => {
    const incompleteTodosCount = useRxValue(incompleteTodosCountRx)
    const callTodoServiceFn = useRxSetPromise(callTodosServiceFn)

    return (
        <footer className="footer">
            <span className="todo-count">
                <strong>{incompleteTodosCount}</strong> item{incompleteTodosCount !== 1 ? "s" : ""} left
            </span>
            <ul className="filters">
                <li>
                    <Link to="/" search={{ filter: "all" }} activeProps={{ className: "selected" }}>
                        All
                    </Link>
                </li>
                <li>
                    <Link to="/" search={{ filter: "active" }} activeProps={{ className: "selected" }}>
                        Active
                    </Link>
                </li>
                <li>
                    <Link to="/" search={{ filter: "completed" }} activeProps={{ className: "selected" }}>
                        Completed
                    </Link>
                </li>
            </ul>
            <button className="clear-completed" onClick={() => callTodoServiceFn((_) => _.clearCompletedTodos())}>
                Clear completed
            </button>
        </footer>
    )
}
