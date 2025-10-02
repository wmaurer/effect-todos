import { useAtomSet } from "@effect-atom/atom-react";

import { createTodoAtom } from "../atom";

import { Input } from "./input";

export const Header = () => {
    const createTodo = useAtomSet(createTodoAtom, { mode: "promise" });

    return (
        <header className="header">
            <h1>todos</h1>
            <Input
                onSubmit={(title) => createTodo(title)}
                label="New Todo Input"
                placeholder="What needs to be done?"
            />
        </header>
    );
};
