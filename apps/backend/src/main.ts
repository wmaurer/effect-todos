import { createServer } from "node:http"

import { HttpApiBuilder, HttpMiddleware } from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import * as Sqlite from "@effect/sql-sqlite-node"
import { Config, Effect, Layer, LogLevel, Logger, String } from "effect"

import { apiGroups } from "./api"
import { TodoRepository } from "./TodoRepository"

import { Api } from "@/domain"

export const HttpApiLive = Layer.provide(HttpApiBuilder.api(Api), apiGroups)

const SqliteLive = Sqlite.SqliteClient.layer({
    filename: ":memory:",
    transformQueryNames: String.camelToSnake,
    transformResultNames: String.snakeToCamel,
})

const NodeHttpServerLive = Effect.gen(function* () {
    const port = yield* Config.number("SERVER_PORT").pipe(Config.withDefault(3000))
    return NodeHttpServer.layer(createServer, { port }).pipe(
        Layer.tap(() => Effect.logInfo(`Server is running on http://localhost:${port}`)),
    )
}).pipe(Layer.unwrapEffect)

const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
    Layer.provide(HttpApiBuilder.middlewareCors()),
    Layer.provide(HttpApiLive),
    Layer.provide(TodoRepository.Default),
    Layer.provide(SqliteLive),
    Layer.provide(NodeHttpServerLive),
)

Layer.launch(HttpLive).pipe(
    Effect.provide(Logger.json),
    Logger.withMinimumLogLevel(LogLevel.All),
    Effect.tapErrorCause(Effect.logError),
    NodeRuntime.runMain({ disablePrettyLogger: true }),
)
