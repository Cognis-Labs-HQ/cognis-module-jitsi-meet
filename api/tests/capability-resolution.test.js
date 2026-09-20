import test from "node:test";
import assert from "node:assert/strict";
import { resolveCtxCapability } from "../reuse/capability-resolution.js";

test("optional capabilities resolve from the scoped registry", () => {
    const provider = () => "scoped";
    const ctx = {
        capabilities: { get: () => provider },
        getCapability: () => () => "top-level",
    };

    assert.equal(
        resolveCtxCapability(ctx, "whiteboard:fetchBoardData"),
        provider,
    );
});

test("optional capabilities resolve from the module context accessor", () => {
    const provider = () => "top-level";
    const ctx = {
        getCapability(capabilityId) {
            return capabilityId === "whiteboard:fetchBoardData"
                ? provider
                : undefined;
        },
    };

    assert.equal(
        resolveCtxCapability(ctx, "whiteboard:fetchBoardData"),
        provider,
    );
});
