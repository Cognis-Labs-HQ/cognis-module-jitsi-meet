# Implement final review comments and improve Whiteboard stability

Whiteboard state is now scoped to the active meeting session, persistent canvases no longer open merely because a meeting starts, and ending or restarting a meeting clears its open state. Component pages are requested once per meeting mount, mounting retries remain bounded, and stale asynchronous windows are discarded when navigation or meeting state makes their request obsolete.

The Whiteboard control now remains disabled with its normal label while keyring access or component mounting is pending. It changes to “Close Whiteboard” only after the component window mounts successfully, and stale cancelled mounts no longer display misleading failure toasts.

Release notes for this pull request now use one localized changelog set named after the feature branch. The contributor instructions define that filename as the branch record and require one translated prose paragraph per commit, in chronological order, instead of a separate metadata block that differs from the established changelog format.
