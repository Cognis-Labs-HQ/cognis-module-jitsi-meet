/** Admit metadata requests without granting access beyond their target meeting. */
export async function requireMeetingResourceClaims(
    req,
    res,
    { requireAuth, getGuestClaims, resolveShareGuestMeetingAccess, sendError },
) {
    const claims =
        (await getGuestClaims?.(req)) ?? requireAuth(req, res, "user");
    if (!claims) return null;
    if (claims.purpose !== "share") return claims;
    const url = new URL(req.url, "http://localhost");
    const meetingId = String(url.searchParams.get("meetingId") ?? "").trim();
    const access = await resolveShareGuestMeetingAccess?.({
        claims,
        meetingId,
        requiredCapability: "meeting:join",
    });
    if (!meetingId || !access?.isGuest || !access.allowed) {
        sendError(res, 403, "forbidden", "Meeting access denied.");
        return null;
    }
    return claims;
}
