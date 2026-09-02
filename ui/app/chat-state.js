export function deactivateMeetingChatState(state, stopCognisChatPolling) {
    stopCognisChatPolling();
    state.chatRoomId = "";
    state.chatRoomKey = null;
    state.chatMode = "meeting";
    state.privateChatUsername = "";
    state.lastMeetingChatRoomId = "";
    state.lastMeetingParticipants = [];
}
