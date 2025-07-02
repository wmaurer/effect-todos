import { useRxSetPromise } from "@effect-rx/rx-react"
import { clsx } from "clsx"
import { FC, useState } from "react"

import { callTodosServiceFn } from "../rx"

import { Input } from "./input"

import { Todo } from "@/domain"

export const Item: FC<{ todo: Todo }> = ({ todo }) => {
    const [isWritable, setIsWritable] = useState(false)
    const callTodoServiceFn = useRxSetPromise(callTodosServiceFn)

    return (
        <li className={clsx({ completed: todo.completed })}>
            <div className="view">
                {isWritable ? (
                    <Input
                        onSubmit={(title) => {
                            callTodoServiceFn((_) => _.updateTodoTitle(todo.id, title))
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
                            onChange={() => callTodoServiceFn((_) => _.toggleTodo(todo.id))}
                        />
                        <label data-testid="todo-item-label" onDoubleClick={() => setIsWritable(true)}>
                            {todo.title}
                        </label>
                        <button
                            className="destroy"
                            data-testid="todo-item-button"
                            onClick={() => callTodoServiceFn((_) => _.removeTodo(todo.id))}
                        />
                    </>
                )}
            </div>
        </li>
    )
}
