import { useAtomSet } from "@effect-atom/atom-react"
import { SearchSchemaInput, createFileRoute } from "@tanstack/react-router"
import { Schema } from "effect"
import { useEffect } from "react"

import { Footer } from "../components/footer"
import { Main } from "../components/main"
import { todosFilterAtom } from "../rx"
import { TodosFilter } from "../Todo"

const schemaValidator =
    <A, I>(schema: Schema.Schema<A, I>) =>
    (input: Schema.Schema.Encoded<typeof schema> & SearchSchemaInput) =>
        Schema.decodeUnknownSync(schema)(input)

class SearchParams extends Schema.Class<SearchParams>("@/RootSearchParams")({
    filter: Schema.optionalWith(TodosFilter, { default: () => "all" }),
}) {}

export const Route = createFileRoute("/")({
    validateSearch: schemaValidator(SearchParams),
    component: Index,
})

function Index() {
    const { filter } = Route.useSearch()

    // const callTodoServiceFn = useRxSetPromise(callTodosServiceFn)
    // const result = useRxSuspense(todosRx)
    const setFilter = useAtomSet(todosFilterAtom)

    useEffect(() => {
        setFilter(filter)
    }, [setFilter, filter])

    // if (Result.isFailure(result)) {
    //     return <div>{Cause.pretty(result.cause)}</div>
    // }

    return (
        <>
            <section className="todoapp">
                <Main />
                <Footer />
            </section>
            <footer className="info">
                <p>Double-click to edit a todo</p>
                <p>
                    Template by <a href="http://sindresorhus.com">Sindre Sorhus</a>
                </p>
                <p>
                    Created by
                    <a target="_blank" href="https://waynemaurer.net" rel="noreferrer">
                        Wayne Maurer
                    </a>
                </p>
            </footer>
        </>
    )
}
