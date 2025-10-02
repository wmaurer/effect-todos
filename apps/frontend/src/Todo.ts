import { Schema } from "effect";

export const TodosFilter = Schema.Enums({
    all: "all" as const,
    active: "active" as const,
    completed: "completed" as const,
});
export type TodosFilter = typeof TodosFilter.Type;
