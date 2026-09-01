export function deactivateMeetingChatState(state, stopNativeChatPolling) {
    stopNativeChatPolling();
    state.chatRoomId = "";
    state.chatRoomKey = null;
    state.chatMode = "meeting";
    state.privateChatUsername = "";
    state.lastMeetingChatRoomId = "";
    state.lastMeetingParticipants = [];
}
