import { Predicate } from "effect";

export const upsertBy = <T>(arr: ReadonlyArray<T>, predicate: Predicate.Predicate<T>, value: T) => {
    const idx = arr.findIndex(predicate);
    if (idx === -1) return [...arr, value];
    return [...arr.slice(0, idx), value, ...arr.slice(idx + 1)];
};
