import test from "node:test";
import assert from "node:assert/strict";
import { configureApiLogger, logApiFallback } from "../reuse/log-fallback.js";

test("API fallbacks use the module-scoped logger", () => {
    const entries = [];
    configureApiLogger((level, message, meta) => {
        entries.push({ level, message, meta });
    });

    const fallback = logApiFallback(
        new Error("unavailable"),
        "load_resource",
        null,
    );

    assert.equal(fallback, null);
    assert.deepEqual(entries, [
        {
            level: "error",
            message: "API operation failed; using fallback.",
            meta: {
                operation: "load_resource",
                error: "unavailable",
            },
        },
    ]);
});
