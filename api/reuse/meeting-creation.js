export function readForceNewMeeting(body, response, sendError) {
    if (body.forceNew === undefined || typeof body.forceNew === "boolean") {
        return body.forceNew === true;
    }
    sendError(response, 400, "bad_request", "forceNew must be a boolean.");
    return null;
}
