import { useAtomValue } from "@effect-atom/atom-react"
import { Array } from "effect"

import { filteredTodosAtom } from "../rx"

import { Item } from "./item"

export const Main = () => {
    const result = useAtomValue(filteredTodosAtom)

    return (
        <section className="main">
            <ul className="todo-list">
                {Array.map(result, (todo) => (
                    <Item todo={todo} key={todo.id} />
                ))}
            </ul>
        </section>
    )
}
