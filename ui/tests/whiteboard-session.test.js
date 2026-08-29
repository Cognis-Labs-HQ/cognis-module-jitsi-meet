import test from "node:test";
import assert from "node:assert/strict";
import {
    ensureComponentPage,
    ensureWhiteboardKeyringUnlocked,
    prepareMeetingCanvas,
} from "../whiteboard-session.js";

test("component page discovery retries while providers finish loading", async () => {
    let requests = 0;
    let refreshes = 0;
    const trigger = {
        componentPage: null,
        requestComponentPage: async () => {
            requests += 1;
            return requests === 3 ? { routeId: "whiteboard" } : null;
        },
        refreshCapabilities: async () => {
            refreshes += 1;
        },
    };

    const page = await ensureComponentPage(trigger, "meeting-a");

    assert.deepEqual(page, { routeId: "whiteboard" });
    assert.equal(requests, 3);
    assert.equal(refreshes, 2);
});

test("keyring access refreshes late capabilities before checking state", async () => {
    let unlockRequests = 0;
    const trigger = {
        i18n: { t: (key) => key },
        async refreshCapabilities() {
            this.isKeyringUnlocked = () => false;
            this.requestKeyringUnlock = async () => {
                unlockRequests += 1;
                return true;
            };
        },
    };

    assert.equal(
        await ensureWhiteboardKeyringUnlocked(trigger, {
            meeting: { id: "meeting-a" },
        }),
        true,
    );
    assert.equal(unlockRequests, 1);
});

test("canvas preparation discards a completion after the meeting changes", async () => {
    let completeCanvasPreparation;
    const canvasRequest = new Promise((resolve) => {
        completeCanvasPreparation = resolve;
    });
    const requests = [];
    const trigger = {
        disposableCanvas: false,
        preparationFailedMeetingId: "",
        preparationPromise: null,
        preparedMeetingId: "meeting-a",
        preparedWhiteboardId: "",
        whiteboardGateway: {
            createCanvas(request) {
                requests.push(request);
                return canvasRequest;
            },
        },
    };
    const state = {
        meeting: {
            id: "meeting-a",
            meetingName: "Original Meeting Name",
            roomSlug: "OriginalMeetingName",
            createdBy: "alice",
            participants: ["alice", "bob"],
        },
    };

    const preparation = prepareMeetingCanvas(trigger, state);
    state.meeting = {
        id: "meeting-b",
        meetingName: "Replacement Meeting Name",
        roomSlug: "ReplacementMeetingName",
        createdBy: "carol",
        participants: ["carol", "dana"],
    };
    trigger.preparedMeetingId = "meeting-b";
    completeCanvasPreparation({ whiteboardId: "canvas-for-meeting-a" });
    await preparation;

    assert.deepEqual(requests, [
        {
            resourceType: "meeting",
            resourceId: "Original Meeting Name",
            title: "Original Meeting Name",
            participantHandles: ["alice", "bob"],
        },
    ]);
    assert.equal(trigger.preparedMeetingId, "meeting-b");
    assert.equal(trigger.preparedWhiteboardId, "");
    assert.equal(trigger.preparationPromise, null);
});
