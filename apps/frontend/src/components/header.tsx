import { useRxSetPromise } from "@effect-rx/rx-react"

import { callTodosServiceFn } from "../rx"

import { Input } from "./input"

export const Header = () => {
    const callTodoServiceFn = useRxSetPromise(callTodosServiceFn)

    return (
        <header className="header">
            <h1>todos</h1>
            <Input
                onSubmit={(title) => callTodoServiceFn((_) => _.createTodo(title))}
                label="New Todo Input"
                placeholder="What needs to be done?"
            />
        </header>
    )
}
