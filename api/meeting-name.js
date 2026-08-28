const GENERATED_MEETING_NAME_PATTERN = /^[A-Z][a-z]+(?:-[A-Z][a-z]+){3}$/;

export function isGeneratedMeetingName(meetingName) {
    return GENERATED_MEETING_NAME_PATTERN.test(String(meetingName ?? ""));
}

export function generateMeetingName(generatePassphrase) {
    if (typeof generatePassphrase !== "function") {
        throw new Error(
            "The reuse:generatePassphrase capability is required to create meetings.",
        );
    }
    const meetingName = generatePassphrase({
        words: 4,
        separator: "-",
        capitalization: "titlecase",
    });
    if (!isGeneratedMeetingName(meetingName)) {
        throw new Error(
            "The reuse:generatePassphrase capability returned an invalid meeting name.",
        );
    }
    return meetingName;
}
