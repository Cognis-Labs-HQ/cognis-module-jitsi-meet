import test from "node:test";
import assert from "node:assert/strict";
import { resolveOptionalCapability } from "../reuse/optional-capability.js";

test("optional capability resolution tolerates deferred provider publication", async () => {
    let attempts = 0;
    const provider = () => ({ id: "board" });
    const capability = await resolveOptionalCapability(
        {
            getCapability(capabilityId) {
                assert.equal(capabilityId, "whiteboard:fetchBoardData");
                attempts += 1;
                return attempts === 3 ? provider : undefined;
            },
        },
        "whiteboard:fetchBoardData",
        { retryDelaysMs: [0, 0, 0] },
    );

    assert.equal(capability, provider);
    assert.equal(attempts, 3);
});

test("optional capability resolution remains optional after retries", async () => {
    const capability = await resolveOptionalCapability(
        { getCapability: () => undefined },
        "whiteboard:fetchBoardData",
        { retryDelaysMs: [0, 0] },
    );

    assert.equal(capability, undefined);
});
