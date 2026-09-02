function isMissingResourceError(error) {
    const status = Number(error?.status ?? error?.statusCode ?? 0);
    const code = String(error?.code ?? "")
        .trim()
        .toLowerCase();
    const message =
        error instanceof Error ? error.message : String(error ?? "");
    return (
        status === 404 ||
        code === "not_found" ||
        code === "resource_not_found" ||
        /\bnot found\b/i.test(message)
    );
}

export async function deleteReferencedMeetingResource({
    deleteResource,
    resourceType,
    resourceId,
    meetingId,
    log,
}) {
    try {
        await deleteResource();
        return true;
    } catch (error) {
        if (!isMissingResourceError(error)) throw error;
        log?.(
            "error",
            "Referenced meeting resource was already absent; cleanup is continuing.",
            {
                component: "jitsi-meet-module",
                operation: "delete_missing_meeting_resource",
                meetingId,
                resourceType,
                resourceId,
                error: error instanceof Error ? error.message : String(error),
            },
        );
        return false;
    }
}
