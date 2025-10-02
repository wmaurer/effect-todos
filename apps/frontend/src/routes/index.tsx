import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { SearchSchemaInput, createFileRoute } from "@tanstack/react-router";
import { Data, Schema } from "effect";
import { Suspense, useEffect } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

import { todosFilterAtom, todosOperationPendingAtom } from "../atom";
import { Footer } from "../components/footer";
import { Header } from "../components/header";
import { Main } from "../components/main";
import { TodosFilter } from "../Todo";

const schemaValidator =
    <A, I>(schema: Schema.Schema<A, I>) =>
    (input: Schema.Schema.Encoded<typeof schema> & SearchSchemaInput) =>
        Schema.decodeUnknownSync(schema)(input);

class SearchParams extends Schema.Class<SearchParams>("@/RootSearchParams")({
    filter: Schema.optionalWith(TodosFilter, { default: () => "all" }),
}) {}

export const Route = createFileRoute("/")({
    validateSearch: schemaValidator(SearchParams),
    component: Index,
});

const fallbackRender = ({ error }: FallbackProps) => {
    console.log(error instanceof Data.Error);
    return (
        <div role="alert">
            <p style={{ color: "red" }}>Something went wrong</p>
        </div>
    );
};
const onError = (error: Error) => {
    if (error instanceof Data.Error) {
        console.log("Data.Error", JSON.stringify(error, null, 2));
        console.log("Data.Error.stack:", error.stack);
    } else {
        console.error("Unknown error:", error);
    }
};

function Index() {
    const { filter } = Route.useSearch();

    const setFilter = useAtomSet(todosFilterAtom);
    const operationPending = useAtomValue(todosOperationPendingAtom);

    useEffect(() => {
        setFilter(filter);
    }, [setFilter, filter]);

    return (
        <ErrorBoundary fallbackRender={fallbackRender} onError={onError}>
            <Suspense fallback={<div>Loading...</div>}>
                <div
                    className="spinner"
                    style={{ display: operationPending ? "block" : "none" }}
                    aria-busy={operationPending}></div>
                <section className="todoapp">
                    <Header />
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
            </Suspense>
        </ErrorBoundary>
    );
}
