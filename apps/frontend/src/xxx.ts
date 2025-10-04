/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpApiClient, HttpClient } from "@effect/platform";
import { BrowserHttpClient } from "@effect/platform-browser";
import { Atom } from "@effect-atom/atom-react";
import { Effect, Layer } from "effect";

import { ApiClient } from "./atom";

import { Api } from "@/domain";

export interface SetRuntimeStep {
    setRuntime<R>(runtime: Atom.AtomRuntime<R>): SetWithDependenciesStep<R>;
}

export interface SetWithDependenciesStep<R> {
    withDependencies<D extends readonly [Effect.Effect<any, any, R>, ...Effect.Effect<any, any, R>[]]>(
        effects: D,
    ): DeclareGetListStep<R, D>;
}

export class AtomListBuilder<R> implements SetRuntimeStep {
    private constructor(private runtime?: Atom.AtomRuntime<R>) {
        this.runtime = runtime;
    }

    static builder(): SetRuntimeStep {
        return new AtomListBuilder();
    }

    setRuntime<R_>(runtime: Atom.AtomRuntime<R_>): SetWithDependenciesStep<R_> {
        return new AtomListBuilder<R_>(runtime);
    }

    withDependencies<D_ extends readonly [Effect.Effect<any, any, R>, ...Effect.Effect<any, any, R>[]]>(
        dependencies: D_,
    ): DeclareGetListStep<R, D_> {
        return new AtomListBuilder2<R, D_, unknown, unknown>(this.runtime, dependencies, undefined);
    }
}

export interface DeclareGetListStep<
    R,
    D extends readonly [Effect.Effect<any, any, R>, ...Effect.Effect<any, any, R>[]],
> {
    declareGetList<A_, E_>(
        fn: (args: { [K in keyof D]: D[K] extends Effect.Effect<infer A, any, any> ? A : never }) => Effect.Effect<
            A_,
            E_,
            R
        >,
    ): FinalStep<R, A_, E_>;
}

export interface FinalStep<R, A, E> {
    build(): { runtime: Atom.AtomRuntime<R>; effect: Effect.Effect<A, E, R> };
}

export class AtomListBuilder2<R, D extends readonly [Effect.Effect<any, any, R>, ...Effect.Effect<any, any, R>[]], A, E>
    implements DeclareGetListStep<R, D>, FinalStep<R, A, E>
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

    declareGetList<A_, E_>(
        fn: (args: { [K in keyof D]: D[K] extends Effect.Effect<infer A, any, any> ? A : never }) => Effect.Effect<
            A_,
            E_,
            R
        >,
    ): FinalStep<R, A_, E_> {
        // In a real implementation, you would run the dependencies and pass their results to fn
        // Here, just store the effect returned by fn for type safety
        const effect = null as any;
        return new AtomListBuilder2<R, D, A_, E_>(this.runtime, this.dependencies, effect);
    }

    build() {
        return {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            runtime: this.runtime!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            effect: this.effect!,
        };
    }
}
const xxx = Effect.gen(function* () {
    const api = yield* HttpClient.HttpClient;
    return yield* Effect.succeed([]);
});
const runtime = Atom.runtime(Layer.merge(ApiClient.layer, BrowserHttpClient.layerXMLHttpRequest));
const fo = HttpApiClient.make(Api);
const b = AtomListBuilder.builder()
    .setRuntime(runtime)
    .withDependencies([HttpClient.HttpClient, ApiClient])
    .declareGetList(([, apiClient]) => apiClient.todos.createTodo({ payload: "a" }));
