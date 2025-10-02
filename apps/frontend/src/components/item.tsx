import { useAtomSet } from "@effect-atom/atom-react";
import { clsx } from "clsx";
import { FC, useState } from "react";

import { removeTodoAtom, toggleTodoAtom, updateTodoTitleAtom } from "../atom";

import { Input } from "./input";

// todo: eslint import rule
import { Todo, TodoId } from "@/domain";

export const Item: FC<{ todo: Todo }> = ({ todo }) => {
    const [isWritable, setIsWritable] = useState(false);

    const toggleTodo = useAtomSet(toggleTodoAtom, { mode: "promise" });
    const removeTodo = useAtomSet(removeTodoAtom);
    const updateTodoTitle = useAtomSet(updateTodoTitleAtom);

    return (
        <li className={clsx({ completed: todo.completed })}>
            <div className="view">
                {isWritable ? (
                    <Input
                        onSubmit={(title) => {
                            updateTodoTitle({ id: todo.id, title });
                            setIsWritable(false);
                        }}
                        label="Edit Todo Input"
                        defaultValue={todo.title}
                        onBlur={() => setIsWritable(false)}
                    />
                ) : (
                    <>
                        <input
                            className="toggle"
                            type="checkbox"
                            data-testid="todo-item-toggle"
                            checked={todo.completed}
                            onChange={() => toggleTodo(TodoId.make(100))}
                        />
                        <label data-testid="todo-item-label" onDoubleClick={() => setIsWritable(true)}>
                            {todo.title}
                        </label>
                        <button
                            className="destroy"
                            data-testid="todo-item-button"
                            onClick={() => removeTodo(todo.id)}
                        />
                    </>
                )}
            </div>
        </li>
    );
};
