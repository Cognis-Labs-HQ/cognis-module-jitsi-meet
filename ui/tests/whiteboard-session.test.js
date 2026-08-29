import test from "node:test";
import assert from "node:assert/strict";
import {
    ensureComponentPage,
    meetingCanvasNeedsPreparation,
    meetingWhiteboardShouldOpen,
    prepareMeetingCanvas,
    spawnComponentWindowWithRetry,
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

test("automatic whiteboard opening tolerates delayed component windows", async () => {
    const retryDelays = [];
    const spawnRequests = [];
    const componentWindow = { discard() {} };
    const trigger = {
        disposableCanvas: false,
        frameWrap: { id: "meeting-stage" },
        signal: new AbortController().signal,
        spawnComponentPage(request) {
            spawnRequests.push(request);
            return spawnRequests.length < 5 ? null : componentWindow;
        },
        async waitForComponentWindowRetry(signal, delayMs) {
            assert.equal(signal.aborted, false);
            retryDelays.push(delayMs);
        },
    };

    const result = await spawnComponentWindowWithRetry(trigger, {
        meetingId: "meeting-a",
        meetingName: "Shared Meeting",
        whiteboardId: "mapped-board",
    });

    assert.equal(result, componentWindow);
    assert.equal(spawnRequests.length, 5);
    assert.deepEqual(retryDelays, [250, 500, 1_000, 2_000]);
    assert.equal(spawnRequests.at(-1).elementId, "meeting-stage");
    assert.equal(spawnRequests.at(-1).context.whiteboardId, "mapped-board");
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

test("share guests without a mapping do not enter canvas preparation loops", () => {
    const trigger = {
        preparedWhiteboardId: "",
        preparationFailedMeetingId: "",
    };
    const meeting = { id: "meeting-a" };

    assert.equal(
        meetingCanvasNeedsPreparation(trigger, {
            shareAccessToken: "guest-token",
            meeting,
        }),
        false,
    );
    assert.equal(
        meetingCanvasNeedsPreparation(trigger, {
            shareAccessToken: "",
            meeting,
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

test("share guests reuse a mapped meeting canvas without creating one", async () => {
    const trigger = {
        disposableCanvas: true,
        preparationFailedMeetingId: "",
        preparationPromise: null,
        preparedMeetingId: "meeting-a",
        preparedWhiteboardId: "",
    };
    const state = {
        shareAccessToken: "guest-token",
        meeting: {
            id: "meeting-a",
            meetingName: "Shared Meeting",
            roomSlug: "SharedMeeting",
            state: {
                whiteboardId: "host-created-board",
                whiteboardDisposable: false,
            },
        },
    };

    await prepareMeetingCanvas(trigger, state);

    assert.equal(trigger.preparedWhiteboardId, "host-created-board");
    assert.equal(trigger.disposableCanvas, false);
});

test("share guests wait for a host mapping instead of creating a canvas", async () => {
    const trigger = {
        disposableCanvas: true,
        preparationFailedMeetingId: "",
        preparationPromise: null,
        preparedMeetingId: "meeting-a",
        preparedWhiteboardId: "",
    };
    const state = {
        shareAccessToken: "guest-token",
        meeting: {
            id: "meeting-a",
            meetingName: "Shared Meeting",
            roomSlug: "SharedMeeting",
            state: {},
        },
    };

    await prepareMeetingCanvas(trigger, state);

    assert.equal(trigger.preparedWhiteboardId, "");
});
