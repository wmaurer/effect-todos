import { Atom, Result } from "@effect-atom/atom-react";
import { Array, Effect } from "effect";

import { upsertBy } from "./array";
import { ApiClient } from "./atom";

type Item<IdKey extends string, IdValueType extends string | number> = {
    [key in IdKey]: IdValueType;
};

type ListActionReplaceAll<IdKey extends string, IdValueType extends string | number> = {
    readonly _tag: "replaceAll";
    readonly items: ReadonlyArray<Item<IdKey, IdValueType>>;
};

type ListActionUpsert<IdKey extends string, IdValueType extends string | number> = {
    readonly _tag: "upsert";
    readonly item: Item<IdKey, IdValueType>;
};

type ListActionRemove<IdValueType extends string | number> = {
    readonly _tag: "remove";
    readonly id: IdValueType;
};

type ListAction<IdKey extends string, IdValueType extends string | number> =
    | ListActionReplaceAll<IdKey, IdValueType>
    | ListActionUpsert<IdKey, IdValueType>
    | ListActionRemove<IdValueType>;

const replaceAll = <IdKey extends string, IdValueType extends string | number>(
    items: ReadonlyArray<Item<IdKey, IdValueType>>,
): ListActionReplaceAll<IdKey, IdValueType> => ({ _tag: "replaceAll", items } satisfies ListAction<IdKey, IdValueType>);

const upsert = <IdKey extends string, IdValueType extends string | number>(
    item: Item<IdKey, IdValueType>,
): ListActionUpsert<IdKey, IdValueType> => ({ _tag: "upsert", item } satisfies ListAction<IdKey, IdValueType>);

const remove = <IdKey extends string, IdValueType extends string | number>(
    id: IdValueType,
): ListActionRemove<IdValueType> => ({ _tag: "remove", id } satisfies ListAction<IdKey, IdValueType>);

const match = <IdKey extends string, IdValueType extends string | number>(
    items: ReadonlyArray<Item<IdKey, IdValueType>>,
    listAction: ListAction<IdKey, IdValueType>,
    key: IdKey,
): Result.Result<ReadonlyArray<Item<IdKey, IdValueType>>, never> => {
    switch (listAction._tag) {
        case "replaceAll":
            return Result.success(listAction.items);
        case "upsert":
            return Result.success(upsertBy(items, (t) => t[key] === listAction.item[key], listAction.item));
        case "remove":
            return Result.success(Array.filter(items, (t) => t[key] !== listAction.id));
    }
};

export interface SetRuntimeStep<R, TAtomRuntime extends Atom.AtomRuntime<R, never>, IdKey extends string, A, E> {
    setRuntime(runtime: Atom.AtomRuntime<R, never>): SetKeyStep<IdKey, A, E>;
}

export interface SetKeyStep<IdKey extends string, A, E> {
    setItemIdKey(itemIdKey: IdKey): DeclareGetListStep<A, E>;
}

export interface DeclareGetListStep<A, E> {
    declareGetList(effect: Effect.Effect<ReadonlyArray<A>, E>): FinalStep;
}

export interface FinalStep {
    build(): void;
}

export class AtomListBuilder<R, E, IdKey extends string, IdValueType extends string | number>
    implements
        SetRuntimeStep<R, IdKey, Item<IdKey, IdValueType>, E>,
        SetKeyStep<IdKey, Item<IdKey, IdValueType>, E>,
        DeclareGetListStep<Item<IdKey, IdValueType>, E>,
        FinalStep
{
    private runtime!: Atom.AtomRuntime<R>;
    private itemIdKey!: IdKey;
    private getListAtom!: Atom.Atom<Result.Result<ReadonlyArray<Item<IdKey, IdValueType>>, E>>;
    private writableListAtom!: Atom.Writable<
        Result.Result<readonly Item<IdKey, IdValueType>[], E>,
        ListAction<IdKey, IdValueType>
    >;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    public static start<R, E, IdKey extends string, IdValueType extends string | number>(): SetRuntimeStep<
        R,
        IdKey,
        Item<IdKey, IdValueType>,
        E
    > {
        return new AtomListBuilder();
    }

    public setRuntime(runtime: Atom.AtomRuntime<R>): SetKeyStep<IdKey, Item<IdKey, IdValueType>, E> {
        this.runtime = runtime;
        return this;
    }

    setItemIdKey(itemIdKey: IdKey): DeclareGetListStep<Item<IdKey, IdValueType>, E> {
        this.itemIdKey = itemIdKey;
        return this;
    }

    public declareGetList(effect: Effect.Effect<Item<IdKey, IdValueType>[], E>) {
        this.getListAtom = this.runtime.atom(effect);

        this.writableListAtom = Atom.writable(
            (get) => get(this.getListAtom),
            (ctx, action: ListAction<IdKey, IdValueType>) => {
                const todos = ctx.get(this.writableListAtom);
                if (!Result.isSuccess(todos)) return;
                ctx.setSelf(match(todos.value, action, this.itemIdKey));
            },
        );

        return this;
    }

    public build() {
        return {
            listAtom: this.writableListAtom,
        };
    }
}

const runtime = Atom.runtime(ApiClient.layer);
const foobar = AtomListBuilder.start().setRuntime(runtime);
