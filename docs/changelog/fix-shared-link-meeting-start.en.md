# Start A Shared-link Meeting Without Participants

**Feature Branch:** fix-shared-link-meeting-start

## Start A Shared-link Meeting Without Participants

An empty participant directory must not block a standalone meeting. Keep the participant finder mounted when the directory is empty so repeated renders can update the Start button after preflight. A successful preflight permits creation without selected participants; failed preflight still prevents starting. The preparation tutorial explains choosing Start without participants and sharing the link after joining.

## Commits
