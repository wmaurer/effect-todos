import { Tuple } from "effect";

import { TodoApiLive } from "./TodoApi";

export const apiGroups = Tuple.make(TodoApiLive);
