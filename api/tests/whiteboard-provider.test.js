import test from "node:test";
import assert from "node:assert/strict";
import {
    resolveWhiteboardFetchBoardData,
    resolveWhiteboardProvider,
} from "../reuse/whiteboard-provider.js";

test("Whiteboard provider resolution uses the provider's public API facade", async () => {
    const provider = {
        marker: "provider",
        async fetchBoardData(whiteboardId) {
            return { id: whiteboardId, marker: this.marker };
        },
        membership: { add() {}, remove() {} },
        deleteCanvas() {},
    };
    const requestedCapabilities = [];
    const ctx = {
        getCapability(capabilityId) {
            requestedCapabilities.push(capabilityId);
            return capabilityId === "whiteboard:api" ? provider : null;
        },
    };

    assert.equal(resolveWhiteboardProvider(ctx), provider);
    const fetchBoardData = resolveWhiteboardFetchBoardData(ctx);
    assert.deepEqual(await fetchBoardData("board-1"), {
        id: "board-1",
        marker: "provider",
    });
    assert.deepEqual(requestedCapabilities, [
        "whiteboard:api",
        "whiteboard:api",
    ]);
});

test("Whiteboard provider resolution remains optional", () => {
    const ctx = { getCapability: () => undefined };
    assert.equal(resolveWhiteboardProvider(ctx), null);
    assert.equal(resolveWhiteboardFetchBoardData(ctx), null);
});
