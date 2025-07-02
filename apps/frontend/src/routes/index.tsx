import { useRxSet, useRxSetPromise, useRxSuspenseSuccess } from "@effect-rx/rx-react"
import { SearchSchemaInput, createFileRoute } from "@tanstack/react-router"
import { Cause, Schema } from "effect"
import { useEffect } from "react"

import * as AsyncData from "../AsyncData"
import { Footer } from "../components/footer"
import { Header } from "../components/header"
import { Main } from "../components/main"
import { callTodosServiceFn, setTodosFilterRx, todosRx } from "../rx"
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
    const callTodoServiceFn = useRxSetPromise(callTodosServiceFn)
    const result = useRxSuspenseSuccess(todosRx)

    useEffect(() => {
        callTodoServiceFn((_) => _.setTodosFilter(filter))
    }, [callTodoServiceFn, filter])

    if (AsyncData.isFailure(result.value)) {
        return <div>{Cause.pretty(result.value.cause)}</div>
    }

    return (
        <>
            <section className="todoapp">
                <Header />
                <Main />
                <Footer />
                {AsyncData.isOptimistic(result.value) && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            opacity: 0.05,
                            cursor: "wait",
                            zIndex: 100,
                        }}></div>
                )}
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
