# Start A Shared-link Meeting Without Participants

**Feature Branch:** fix-shared-link-meeting-start

## Start A Shared-link Meeting Without Participants

An empty participant directory must not block a standalone meeting. Keep the participant finder mounted when the directory is empty so repeated renders can update the Start button after preflight. A successful preflight permits creation without selected participants; failed preflight still prevents starting. The preparation tutorial explains choosing Start without participants and sharing the link after joining.

## Commits

- [f09d09c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f09d09c7fcea1369d4352da849efdb6c0548ce75)
