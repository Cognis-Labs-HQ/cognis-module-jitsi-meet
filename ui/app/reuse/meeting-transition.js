export function isMeetingSelectionLocked(state) {
    return Boolean(
        state.meetingTransition ||
        (state.meeting?.id &&
            (state.jitsiApi ||
                state.meeting.waitingForAuthentication ||
                state.meeting.requiresReclaim ||
                state.meeting.state?.authRequired)),
    );
}

export function claimMeetingTransition(state, signal) {
    if (state.meetingTransition || signal?.aborted) return null;
    const token = {};
    state.meetingTransition = token;
    return {
        isCurrent: () => state.meetingTransition === token && !signal?.aborted,
        release() {
            if (state.meetingTransition === token)
                state.meetingTransition = null;
        },
    };
}
