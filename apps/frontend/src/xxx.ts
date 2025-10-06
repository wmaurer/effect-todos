/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpClient } from "@effect/platform";
import { BrowserHttpClient } from "@effect/platform-browser";
import { Atom } from "@effect-atom/atom-react";
import { Array, Effect, Layer } from "effect";

import { ApiClient } from "./atom";

import { Todo } from "@/domain";

export interface SetRuntimeStep {
    setRuntime<R>(runtime: Atom.AtomRuntime<R>): SetWithDependenciesStep<R> & DeclareGetListStep<R>;
}

export interface SetWithDependenciesStep<R> {
    withDependencies<D extends readonly [Effect.Effect<any, any, R>, ...Effect.Effect<any, any, R>[]]>(
        effects: D,
    ): DeclareGetListWithDependenciesStep<R, D>;
}

export interface DeclareGetListStep<R> {
    declareGetList<A2, E2>(effect: Effect.Effect<ReadonlyArray<A2>, E2, R>): SetWithDependenciesStep<R>;
}

export class ListAtomBuilder<R, A, E> implements SetRuntimeStep, DeclareGetListStep<R>, SetWithDependenciesStep<R> {
    private constructor(private runtime?: Atom.AtomRuntime<R>, private effect?: Effect.Effect<ReadonlyArray<A>, E, R>) {
        this.runtime = runtime;
    }

    static builder(): SetRuntimeStep & DeclareGetListStep<void> {
        return new ListAtomBuilder();
    }

    setRuntime<R2>(runtime: Atom.AtomRuntime<R2>): SetWithDependenciesStep<R2> & DeclareGetListStep<R2> {
        return new ListAtomBuilder<R2, unknown, unknown>(runtime);
    }

    declareGetList<A2, E2>(
        effect: Effect.Effect<ReadonlyArray<A2>, E2, R>,
    ): SetWithDependenciesStep<R> & DeclareGetListStep<R> {
        return new ListAtomBuilder<R, A2, E2>(this.runtime, effect);
    }

    withDependencies<D2 extends readonly [Effect.Effect<any, any, R>, ...Effect.Effect<any, any, R>[]]>(
        dependencies: D2,
    ): DeclareGetListWithDependenciesStep<R, D2> {
        return new ListAtomBuilder2<R, D2, unknown, unknown>(this.runtime, dependencies, undefined);
    }
}

export interface DeclareGetListWithDependenciesStep<
    R,
    D extends readonly [Effect.Effect<any, any, R>, ...Effect.Effect<any, any, R>[]],
> {
    declareGetList<A2, E2>(
        fn: (args: {
            [K in keyof D]: D[K] extends Effect.Effect<infer A, any, any> ? A : never;
        }) => Effect.Effect<ReadonlyArray<A2>, E2, R>,
    ): WithDependenciesSetWithDependenciesStep<R> & DeclareListOperationStep<R, D> & FinalStep<R, A2, E2>;
}

export interface WithDependenciesSetWithDependenciesStep<R> {
    withDependencies<D extends readonly [Effect.Effect<any, any, R>, ...Effect.Effect<any, any, R>[]]>(
        effects: D,
    ): DeclareListOperationStep<R, D>;
}

export interface DeclareListOperationStep<
    R,
    D extends readonly [Effect.Effect<any, any, R>, ...Effect.Effect<any, any, R>[]],
> {
    declareListOperation<A2, E2>(
        fn: (args: {
            [K in keyof D]: D[K] extends Effect.Effect<infer A, any, any> ? A : never;
        }) => Effect.Effect<ReadonlyArray<A2>, E2, R>,
    ): WithDependenciesSetWithDependenciesStep<R> & DeclareListOperationStep<R, D> & FinalStep<R, A2, E2>;
}

export interface FinalStep<R, A, E> {
    build(): { runtime: Atom.AtomRuntime<R>; effect: Effect.Effect<A, E, R> };
}

export class ListAtomBuilder2<R, D extends readonly [Effect.Effect<any, any, R>, ...Effect.Effect<any, any, R>[]], A, E>
    implements
        DeclareGetListWithDependenciesStep<R, D>,
        WithDependenciesSetWithDependenciesStep<R>,
        DeclareListOperationStep<R, D>,
        FinalStep<R, A, E>
{
    private dependencies?: readonly Effect.Effect<any, any, R>[];
    constructor(
        private runtime?: Atom.AtomRuntime<R>,
        dependencies?: readonly Effect.Effect<any, any, R>[],
        private effect?: Effect.Effect<A, E, R>,
    ) {
        this.runtime = runtime;
        this.dependencies = dependencies;
    }

    declareGetList<A2, E2>(
        fn: (args: {
            [K in keyof D]: D[K] extends Effect.Effect<infer A, any, any> ? A : never;
        }) => Effect.Effect<ReadonlyArray<A2>, E2, R>,
    ): WithDependenciesSetWithDependenciesStep<R> & DeclareListOperationStep<R, D> & FinalStep<R, A2, E2> {
        const effect = null as any;
        return new ListAtomBuilder2<R, D, A2, E2>(this.runtime, this.dependencies, effect);
    }

    withDependencies<D2 extends readonly [Effect.Effect<any, any, R>, ...Effect.Effect<any, any, R>[]]>(
        dependencies: D2,
    ): DeclareListOperationStep<R, D2> {
        return new ListAtomBuilder2<R, D2, unknown, unknown>(this.runtime, dependencies, undefined);
    }

    declareListOperation<A2, E2>(
        fn: (args: {
            [K in keyof D]: D[K] extends Effect.Effect<infer A, any, any> ? A : never;
        }) => Effect.Effect<ReadonlyArray<A2>, E2, R>,
    ): WithDependenciesSetWithDependenciesStep<R> & DeclareListOperationStep<R, D> & FinalStep<R, A2, E2> {
        const effect = null as any;
        return new ListAtomBuilder2<R, D, A2, E2>(this.runtime, this.dependencies, effect);
    }

    build() {
        return { runtime: this.runtime!, effect: this.effect! };
    }
}

const result1 = ListAtomBuilder.builder()
    .declareGetList(Effect.succeed(Array.empty<Todo>()))
    .withDependencies([HttpClient.HttpClient, ApiClient]);

const runtime2 = Atom.runtime(Layer.merge(ApiClient.layer, BrowserHttpClient.layerXMLHttpRequest));
const result2 = ListAtomBuilder.builder()
    .setRuntime(runtime2)
    .withDependencies([HttpClient.HttpClient, ApiClient])
    .declareGetList(([, apiClient]) => apiClient.todos.getAllTodos())
    .withDependencies([ApiClient])
    .declareListOperation(([apiClient]) => apiClient.todos.getAllTodos())
    .withDependencies([HttpClient.HttpClient, ApiClient])
    .declareListOperation(([, apiClient]) => apiClient.todos.getAllTodos())
    .build();

// TODO: type level checks especially with E and R
