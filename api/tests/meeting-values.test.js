import assert from "node:assert/strict";
import test from "node:test";
import { generateMeetingName } from "../meeting-values.js";

test("meeting names are four-word title-cased passphrases", () => {
    const meetingName = generateMeetingName();

    assert.match(meetingName, /^[A-Z][a-z]+(?: [A-Z][a-z]+){3}$/);
});
