import { Cause, Either, Function, Option, Unify } from "effect"

// This file has been largely copied from the typed-async-data library (licensed under the MIT License).
// The original source can be found here:
// https://github.com/TylorS/typed-async-data/blob/development/src/AsyncData.ts
// For some reason, the original library does not work with correctly in this App.
// It's something to do with Stream.map, but I'm struggling to create a minimal reproduction
// but as soon as I do, I'll open an issue in the original repo.

export class NoData {
    readonly _tag = "NoData"
}

export function noData(): NoData
export function noData<A, E = never>(): AsyncData<A, E>
export function noData<A, E = never>(): AsyncData<A, E> {
    return new NoData()
}

export class Progress {
    constructor(public readonly loaded: number, public readonly total: Option.Option<number> = Option.none()) {}
}

export class Loading {
    readonly _tag = "Loading"
    constructor(public readonly progress: Option.Option<Progress>) {}
}

export function loading(progress?: Progress): Loading
export function loading<A, E = never>(progress?: Progress): AsyncData<A, E>
export function loading<A, E = never>(progress?: Progress): AsyncData<A, E> {
    return new Loading(Option.fromNullable(progress))
}

export class Success<A> {
    readonly _tag = "Success"
    constructor(public readonly value: A) {}
}

export function success<A>(value: A): Success<A>
export function success<A, E = never>(value: A): AsyncData<A, E>
export function success<A>(value: A): Success<A> {
    return new Success(value)
}

export class Failure<E> {
    readonly _tag = "Failure"
    constructor(public readonly cause: Cause.Cause<E>) {}
}
export function failure<E>(cause: Cause.Cause<E>): Failure<E>
export function failure<E, A = never>(cause: Cause.Cause<E>): AsyncData<A, E>
export function failure<E>(cause: Cause.Cause<E>): Failure<E> {
    return new Failure(cause)
}

export function die(cause: unknown): Failure<never>
export function die<A, E = never>(cause: unknown): AsyncData<A, E>
export function die<E>(cause: unknown): Failure<E> {
    return new Failure(Cause.die(cause))
}

export function fail<E>(error: E): Failure<E> {
    return new Failure(Cause.fail(error))
}

export class Refreshing<A, E = never> {
    readonly _tag = "Refreshing"
    constructor(public readonly previous: Success<A> | Failure<E>, public readonly progress: Option.Option<Progress>) {}
}

export function refreshing<A = never, E = never>(
    previous: Success<A> | Failure<E>,
    progress?: Progress,
): Refreshing<A, E> {
    return new Refreshing(previous, Option.fromNullable(progress))
}

export class Optimistic<A, E = never> {
    readonly _tag = "Optimistic"
    constructor(public readonly previous: AsyncData<A, E>, public readonly value: A) {}
}

export function optimistic<A, E = never>(previous: AsyncData<A, E>, value: A): Optimistic<A, E> {
    return new Optimistic(previous, value)
}

export type AsyncData<A, E = never> = NoData | Loading | Success<A> | Failure<E> | Refreshing<A, E> | Optimistic<A, E>

export const matchAll: {
    <A, E, R1, R2, R3, R4, R5, R6>(
        data: AsyncData<A, E>,
        matchers: {
            readonly NoData: () => R1
            readonly Loading: (progress: Option.Option<Progress>) => R2
            readonly Success: (value: A) => R3
            readonly Failure: (cause: Cause.Cause<E>) => R4
            readonly Refreshing: (previous: Success<A> | Failure<E>, progress: Option.Option<Progress>) => R5
            readonly Optimistic: (value: A, previous: AsyncData<A, E>) => R6
        },
    ): R1 | R2 | R3 | R4 | R5 | R6

    <A, E, R1, R2, R3, R4, R5, R6>(
        data: AsyncData<A, E>,
        matchers: {
            readonly NoData: () => R1
            readonly Loading: (progress: Option.Option<Progress>) => R2
            readonly Success: (value: A) => R3
            readonly Failure: (cause: Cause.Cause<E>) => R4
            readonly Refreshing: (previous: Success<A> | Failure<E>, progress: Option.Option<Progress>) => R5
            readonly Optimistic: (value: A, previous: AsyncData<A, E>) => R6
        },
    ): R1 | R2 | R3 | R4 | R5 | R6
} = Function.dual(
    2,
    function matchAll<A, E, R1, R2, R3, R4, R5, R6>(
        data: AsyncData<A, E>,
        matchers: {
            readonly NoData: () => R1
            readonly Loading: (progress: Option.Option<Progress>) => R2
            readonly Success: (value: A) => R3
            readonly Failure: (cause: Cause.Cause<E>) => R4
            readonly Refreshing: (previous: Success<A> | Failure<E>, progress: Option.Option<Progress>) => R5
            readonly Optimistic: (value: A, previous: AsyncData<A, E>) => R6
        },
    ): R1 | R2 | R3 | R4 | R5 | R6 {
        switch (data._tag) {
            case "NoData":
                return matchers.NoData()
            case "Loading":
                return matchers.Loading(data.progress)
            case "Success":
                return matchers.Success(data.value)
            case "Failure":
                return matchers.Failure(data.cause)
            case "Refreshing":
                return matchers.Refreshing(data.previous, data.progress)
            case "Optimistic":
                return matchers.Optimistic(data.value, data.previous)
        }
    },
)

export const match: {
    <A, E, R1, R2, R3, R4>(matchers: {
        readonly NoData: () => R1
        readonly Loading: (progress: Option.Option<Progress>) => R2
        readonly Success: (
            value: A,
            params: {
                readonly isRefreshing: boolean
                readonly isOptimistic: boolean
                readonly progress: Option.Option<Progress>
            },
        ) => R3
        readonly Failure: (
            cause: Cause.Cause<E>,
            params: { readonly isRefreshing: boolean; readonly progress: Option.Option<Progress> },
        ) => R4
    }): (data: AsyncData<A, E>) => Unify.Unify<R1 | R2 | R3 | R4>

    <A, E, R1, R2, R3, R4>(
        data: AsyncData<A, E>,
        matchers: {
            readonly NoData: () => R1
            readonly Loading: (progress: Option.Option<Progress>) => R2
            readonly Success: (
                value: A,
                params: {
                    readonly isRefreshing: boolean
                    readonly isOptimistic: boolean
                    readonly progress: Option.Option<Progress>
                },
            ) => R3
            readonly Failure: (
                cause: Cause.Cause<E>,
                params: { readonly isRefreshing: boolean; readonly progress: Option.Option<Progress> },
            ) => R4
        },
    ): Unify.Unify<R1 | R2 | R3 | R4>
} = Function.dual(
    2,
    function match<A, E, R1, R2, R3, R4>(
        data: AsyncData<A, E>,
        matchers: {
            readonly NoData: () => R1
            readonly Loading: (progress: Option.Option<Progress>) => R2
            readonly Success: (
                value: A,
                params: {
                    readonly isRefreshing: boolean
                    readonly isOptimistic: boolean
                    readonly progress: Option.Option<Progress>
                },
            ) => R3
            readonly Failure: (
                cause: Cause.Cause<E>,
                params: { readonly isRefreshing: boolean; readonly progress: Option.Option<Progress> },
            ) => R4
        },
    ): Unify.Unify<R1 | R2 | R3 | R4> {
        const match_ = (
            data: AsyncData<A, E>,
            params: {
                readonly isRefreshing: boolean
                readonly isOptimistic: boolean
                readonly progress: Option.Option<Progress>
            },
        ): R1 | R2 | R3 | R4 =>
            matchAll(data, {
                NoData: matchers.NoData,
                Loading: matchers.Loading,
                Success: (value) => matchers.Success(value, params),
                Failure: (cause) => matchers.Failure(cause, params),
                Refreshing: (previous, progress) => match_(previous, { ...params, isRefreshing: true, progress }),
                Optimistic: (value) => matchers.Success(value, { ...params, isOptimistic: true }),
            })

        return Unify.unify(
            match_(data, {
                isRefreshing: false,
                isOptimistic: false,
                progress: Option.none(),
            }),
        )
    },
)

export function fromEither<A, E>(either: Either.Either<A, E>): AsyncData<A, E> {
    return Either.match(either, { onLeft: fail<E>, onRight: success<A> })
}

export function fromOption<A>(option: Option.Option<A>): AsyncData<A> {
    return Option.match(option, { onSome: success<A>, onNone: noData<A> })
}

export const map: {
    <A, B>(f: (a: A) => B): <E>(data: AsyncData<A, E>) => AsyncData<B, E>
    <A, E, B>(data: AsyncData<A, E>, f: (a: A) => B): AsyncData<B, E>
} = Function.dual(2, function map<A, E, B>(data: AsyncData<A, E>, f: (a: A) => B): AsyncData<B, E> {
    if (data._tag === "Success") {
        return new Success(f(data.value))
    } else if (data._tag === "Refreshing" && data.previous._tag === "Success") {
        return new Refreshing(new Success(f(data.previous.value)), data.progress)
    } else if (data._tag === "Optimistic") {
        if (data.previous._tag === "Success") {
            return new Optimistic(new Success(f(data.previous.value)), f(data.value))
        } else if (data.previous._tag === "Failure") {
            return new Optimistic(data.previous, f(data.value))
        }
    }

    return data as AsyncData<B, E>
})

export const flatMap: {
    <A, B, E2>(f: (a: A) => AsyncData<B, E2>): <E>(data: AsyncData<A, E>) => AsyncData<B, E | E2>
    <A, E, B, E2>(data: AsyncData<A, E>, f: (a: A) => AsyncData<B, E2>): AsyncData<B, E | E2>
} = Function.dual(2, function flatMap<A, E, B, E2>(data: AsyncData<A, E>, f: (a: A) => AsyncData<B, E2>): AsyncData<
    B,
    E | E2
> {
    if (data._tag === "Success" || data._tag === "Optimistic") {
        return f(data.value)
    } else if (data._tag === "Refreshing" && data.previous._tag === "Success") {
        return f(data.previous.value)
    }

    return data as AsyncData<B, E>
})

export function isNoData<A, E>(data: AsyncData<A, E>): data is NoData {
    return data._tag === "NoData"
}

export function isLoading<A, E>(data: AsyncData<A, E>): data is Loading {
    return data._tag === "Loading"
}

export function isSuccess<A, E>(data: AsyncData<A, E>): data is Success<A> {
    return data._tag === "Success"
}

export function isFailure<A, E>(data: AsyncData<A, E>): data is Failure<E> {
    return data._tag === "Failure"
}

export function isRefreshing<A, E>(data: AsyncData<A, E>): data is Refreshing<A, E> {
    return data._tag === "Refreshing"
}

export function isLoadingOrRefreshing<A, E>(data: AsyncData<A, E>): data is Loading | Refreshing<A, E> {
    return isLoading(data) || isRefreshing(data)
}

export function isOptimistic<A, E>(data: AsyncData<A, E>): data is Optimistic<A, E> {
    return data._tag === "Optimistic"
}

export const getOrElse: {
    <B>(onNone: Function.LazyArg<B>): <A, E>(self: AsyncData<A, E>) => B | A
    <A, E, B>(self: AsyncData<A, E>, onNone: Function.LazyArg<B>): A | B
} = Function.dual(2, function getOrElse<A, E, B>(data: AsyncData<A, E>, defaultValue: Function.LazyArg<B>): A | B {
    if (isSuccess(data)) {
        return data.value
    } else if (isOptimistic(data)) {
        return data.value
    }
    return defaultValue()
})
