import { useAtomSet, useAtomSuspense } from "@effect-atom/atom-react";
import { Link } from "@tanstack/react-router";

import { clearCompletedTodosAtom, incompleteTodosCountAtom } from "../atom";

export const Footer = () => {
    const incompleteTodosCount = useAtomSuspense(incompleteTodosCountAtom);
    const clearCompletedTodos = useAtomSet(clearCompletedTodosAtom);

    return (
        <footer className="footer">
            <span className="todo-count">
                <strong>{incompleteTodosCount.value}</strong> item{incompleteTodosCount.value !== 1 ? "s" : ""} left
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
            <button className="clear-completed" onClick={() => clearCompletedTodos()}>
                Clear completed
            </button>
        </footer>
    );
};
