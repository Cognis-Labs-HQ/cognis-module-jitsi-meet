import test from "node:test";
import assert from "node:assert/strict";
import { clearJitsiAuthenticationSession } from "../reuse/jitsi-storage.js";

function createStorage(initialValue) {
    const values = new Map();
    if (initialValue !== undefined) {
        values.set("jitsiLocalStorage", initialValue);
    }
    return {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
        value: () => values.get("jitsiLocalStorage"),
    };
}

test("stale Jitsi authentication sessions are removed before embedding", () => {
    const storage = createStorage(
        JSON.stringify({ sessionId: "expired", displayName: "User" }),
    );

    assert.deepEqual(clearJitsiAuthenticationSession(storage), {
        cleared: true,
        malformed: false,
        unavailable: false,
    });
    assert.deepEqual(JSON.parse(storage.value()), { displayName: "User" });
});

test("valid Jitsi settings without a session remain unchanged", () => {
    const value = JSON.stringify({ displayName: "User" });
    const storage = createStorage(value);

    assert.deepEqual(clearJitsiAuthenticationSession(storage), {
        cleared: false,
        malformed: false,
        unavailable: false,
    });
    assert.equal(storage.value(), value);
});

test("malformed Jitsi settings are reported without overwriting them", () => {
    const storage = createStorage("not-json");

    assert.deepEqual(clearJitsiAuthenticationSession(storage), {
        cleared: false,
        malformed: true,
        unavailable: false,
    });
    assert.equal(storage.value(), "not-json");
});

test("unavailable browser storage is treated as a recoverable fallback", () => {
    const storage = {
        getItem() {
            const error = new Error("Storage is unavailable");
            error.name = "SecurityError";
            throw error;
        },
    };

    assert.deepEqual(clearJitsiAuthenticationSession(storage), {
        cleared: false,
        malformed: false,
        unavailable: true,
    });
});
