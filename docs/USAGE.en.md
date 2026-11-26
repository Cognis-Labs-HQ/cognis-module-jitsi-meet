# Usage

Join and host video meetings from Cognis.

## Prerequisites

An administrator must configure a reachable Jitsi server and enable Meetings. Allow camera and microphone access when needed. Shared links follow their access and password requirements.

## Examples

Open Meetings, optionally choose participants and wait for the connection check. Select Start to enter the meeting, then use its sharing control to invite others.

- In Administration → Modules, configure an HTTP(S) Jitsi instance URL, run the enablement test and enable Jitsi Meet. Administration → Meetings lists active and upcoming meetings.
- Open Meetings, select participants and start or join a room. A visible profile handle is required for profile-dependent operations. Existing active membership remains discoverable through the authenticated account identity if its profile handle becomes unavailable.
- Drop an available participant into a running meeting to request Share approval. A decline restores the participant to the available list and shows a toast.
- Select Whiteboard to open the meeting canvas, or Close Whiteboard to close it. Screen sharing disables that control with an explanatory tooltip. Link-share guests follow the organizer’s state without a visible control.

Browser callers obtain the module’s VoIP integration from the host-initialized context:

```js
const startCall = uiCtx.capabilities.get("voip:startCall");
const action = await startCall({
    source: "messages",
    room: { id: roomId, kind: "group" },
    users: members,
    supportedActions: ["component"],
});
```

The returned action describes a Meetings component; the caller launches it through the host component-page contract.

The play introduces meetings and staged participants without joining or creating a meeting. It requires an authenticated online session.

## Expected Results

A successful preparation opens the meeting. An empty participant directory still permits a standalone meeting when the connection check succeeds.

## Troubleshooting

For failed preparation, check the Jitsi address, network access and browser permissions. Ask the meeting owner about denied shared links; selecting participants does not repair a failed server check.
