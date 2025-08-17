import { useAtomValue } from "@effect-atom/atom-react"
import { Link } from "@tanstack/react-router"

import { incompleteTodosCountAtom } from "../rx"

export const Footer = () => {
    const incompleteTodosCount = useAtomValue(incompleteTodosCountAtom)

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
            {/* <button className="clear-completed" onClick={() => callTodoServiceFn((_) => _.clearCompletedTodos())}>
                Clear completed
            </button> */}
        </footer>
    )
}
