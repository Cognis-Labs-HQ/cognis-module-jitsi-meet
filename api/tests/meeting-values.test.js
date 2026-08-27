import test from "node:test";
import assert from "node:assert/strict";
import { generateMeetingName } from "../meeting-values.js";

test("meeting names are five-word phrases generated without external packages", () => {
    for (let index = 0; index < 20; index += 1) {
        assert.match(generateMeetingName(), /^[A-Z][a-z]+(?: [A-Z][a-z]+){4}$/);
    }
});
