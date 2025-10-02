import { useAtomSet, useAtomSuspense } from "@effect-atom/atom-react";
import { Array } from "effect";

import { filteredTodosAtom, toggleAllTodosAtom } from "../atom";

import { Item } from "./item";

export const Main = () => {
    const todos = useAtomSuspense(filteredTodosAtom);
    const toggleAllTodos = useAtomSet(toggleAllTodosAtom);

    return (
        <section className="main">
            <input
                className="toggle-all"
                type="checkbox"
                id="toggle-all"
                checked={Array.every(todos.value, (todo) => todo.completed)}
                onChange={(e) => toggleAllTodos(e.target.checked)}
            />
            <label htmlFor="toggle-all">Mark all as complete</label>
            <ul className="todo-list">
                {Array.map(todos.value, (todo) => (
                    <Item todo={todo} key={todo.id} />
                ))}
            </ul>
        </section>
    );
};
