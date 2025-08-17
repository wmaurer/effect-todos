import { useAtomSet } from "@effect-atom/atom-react"
import { clsx } from "clsx"
import { FC, useState } from "react"

import { toggleTodoAtom } from "../rx"

import { Input } from "./input"

// todo: eslint import rule
import { Todo } from "@/domain"

export const Item: FC<{ todo: Todo }> = ({ todo }) => {
    const [isWritable, setIsWritable] = useState(false)
    const toggleTodo = useAtomSet(toggleTodoAtom, { mode: "promise" })

    return (
        <li className={clsx({ completed: todo.completed })}>
            <div className="view">
                {isWritable ? (
                    <Input
                        onSubmit={(title) => {
                            // callTodoServiceFn((_) => _.updateTodoTitle(todo.id, title))
                            setIsWritable(false)
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
                            onChange={() => toggleTodo({ id: todo.id, completed: !todo.completed })}
                        />
                        <label data-testid="todo-item-label" onDoubleClick={() => setIsWritable(true)}>
                            {todo.title}
                        </label>
                        <button
                            className="destroy"
                            data-testid="todo-item-button"
                            onClick={() => {
                                // return callTodoServiceFn((_) => _.removeTodo(todo.id))
                            }}
                        />
                    </>
                )}
            </div>
        </li>
    )
}
