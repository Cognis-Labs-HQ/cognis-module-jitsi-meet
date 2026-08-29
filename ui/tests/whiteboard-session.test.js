import test from "node:test";
import assert from "node:assert/strict";
import {
    ensureComponentPage,
    meetingWhiteboardShouldOpen,
    prepareMeetingCanvas,
} from "../whiteboard-session.js";

test("component page discovery makes one broker request per mount", async () => {
    let requests = 0;
    const componentPage = { routeId: "whiteboard" };
    const trigger = {
        componentPage: null,
        requestComponentPage: async () => {
            requests += 1;
            return componentPage;
        },
    };

    assert.equal(
        await ensureComponentPage(trigger, "meeting-a"),
        componentPage,
    );
    assert.equal(
        await ensureComponentPage(trigger, "meeting-a"),
        componentPage,
    );
    assert.equal(requests, 1);
});

test("persistent mappings stay closed unless the current meeting opened them", () => {
    assert.equal(
        meetingWhiteboardShouldOpen({
            state: {
                whiteboardId: "persistent-board",
                whiteboardDisposable: false,
                whiteboardOpen: false,
            },
        }),
        false,
    );
    assert.equal(
        meetingWhiteboardShouldOpen({
            state: {
                whiteboardId: "persistent-board",
                whiteboardDisposable: false,
                whiteboardOpen: true,
            },
        }),
        true,
    );
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
