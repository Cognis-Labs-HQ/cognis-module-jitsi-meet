export function generateMeetingName(generatePassphrase) {
    if (typeof generatePassphrase !== "function") {
        throw new Error(
            "The reuse:generatePassphrase capability is required to create meetings.",
        );
    }
    return generatePassphrase({
        words: 4,
        separator: "-",
        capitalization: "titlecase",
    });
}
