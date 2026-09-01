import { importReuseModule } from "./reuse/resources.js";

const { escapeHtml } = await importReuseModule("escape-html.js");

export function buildStageMarkup(i18n) {
    return `
    <div class="jitsi-meeting-stage card-elevated">
      <header class="jitsi-stage-header">
        <h3>${escapeHtml(i18n.t("module.jitsi_meet.overlay.title"))}</h3>
        <div class="jitsi-stage-actions"><div id="jitsi-share-button-slot" class="jitsi-share-button-slot"></div><div id="jitsi-whiteboard-button-slot"></div></div>
      </header>
      <div class="jitsi-stage-frame-wrap">
        <div id="jitsi-meeting-frame" class="jitsi-stage-frame" title="${escapeHtml(i18n.t("ui.reuse.meeting"))}" hidden></div>
        <div class="jitsi-whiteboard-component-shell" hidden><div class="jitsi-whiteboard-component-host"></div></div>
        <div id="jitsi-overlay" class="jitsi-overlay">
          <div id="jitsi-staged-participants" class="jitsi-staged-participants" role="list"></div>
          <h3 class="jitsi-overlay-title">${escapeHtml(i18n.t("module.jitsi_meet.overlay.title"))}</h3>
          <p id="jitsi-overlay-message" class="jitsi-overlay-message">${escapeHtml(i18n.t("module.jitsi_meet.overlay.select_participants"))}</p>
          <section class="jitsi-overlay-active-meetings" aria-label="${escapeHtml(i18n.t("module.jitsi_meet.participants.active_meetings"))}">
            <p class="jitsi-overlay-active-meetings-label">${escapeHtml(i18n.t("module.jitsi_meet.participants.active_meetings"))}</p>
            <div id="jitsi-active-meetings" class="jitsi-active-meetings" role="grid"></div>
          </section>
          <div class="jitsi-overlay-actions">
            <button id="jitsi-start-btn" class="btn-confirm btn-animated" type="button" disabled>${escapeHtml(i18n.t("module.jitsi_meet.overlay.start_meeting"))}</button>
            <button id="jitsi-auth-btn" class="btn-cancel" type="button" hidden>${escapeHtml(i18n.t("module.jitsi_meet.overlay.authenticate"))}</button>
            <button id="jitsi-reclaim-btn" class="btn-confirm" type="button" hidden>${escapeHtml(i18n.t("module.jitsi_meet.overlay.remain_in_meeting"))}</button>
            <button id="jitsi-leave-alone-btn" class="btn-cancel" type="button" hidden>${escapeHtml(i18n.t("module.jitsi_meet.overlay.leave_meeting"))}</button>
            <button id="jitsi-remain-alone-btn" class="btn-confirm" type="button" hidden>${escapeHtml(i18n.t("module.jitsi_meet.overlay.remain_in_meeting"))}</button>
          </div>
          <div id="jitsi-loading" class="jitsi-loading" hidden>
            <span id="jitsi-loading-indicator" class="jitsi-spinner" aria-hidden="true"></span>
            <span id="jitsi-loading-text">${escapeHtml(i18n.t("module.jitsi_meet.overlay.loading"))}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function buildChatMarkup(i18n) {
    return `
    <aside class="jitsi-chat-pane jitsi-chat-disabled card-elevated" aria-disabled="true">
      <header class="jitsi-chat-header">
        <h3 id="jitsi-chat-heading" class="jitsi-section-heading">${escapeHtml(i18n.t("module.jitsi_meet.chat.heading"))}</h3>
        <button id="jitsi-chat-return-btn" class="jitsi-chat-return-btn" type="button" hidden>${escapeHtml(i18n.t("module.jitsi_meet.chat.return_to_meeting"))}</button>
      </header>
      <div id="jitsi-chat-participant-strip" class="jitsi-chat-participant-strip" role="list" aria-label="${escapeHtml(i18n.t("module.jitsi_meet.chat.participants"))}"></div>
      <div id="jitsi-chat-thread" class="jitsi-chat-thread" aria-live="polite" aria-busy="true"></div>
      <form id="jitsi-chat-form" class="jitsi-chat-form" hidden>
        <textarea id="jitsi-chat-input" class="jitsi-chat-input" rows="3" placeholder="${escapeHtml(i18n.t("module.jitsi_meet.chat.placeholder"))}" disabled></textarea>
      </form>
    </aside>
  `;
}

export function buildParticipantsMarkup(i18n) {
    return `
    <section class="jitsi-participants-pane card-elevated">
      <div class="jitsi-participants-layout">
        <div class="jitsi-participants-grid-column jitsi-available-participants-column">
          <header class="jitsi-participants-header">
            <h3>${escapeHtml(i18n.t("module.jitsi_meet.participants.heading"))}</h3>
          </header>
          <p class="jitsi-participants-pool-label">${escapeHtml(i18n.t("module.jitsi_meet.participants.available"))}</p>
          <div id="jitsi-available-participants" class="jitsi-avatar-pool" role="list">
            <button id="jitsi-find-participants-btn" class="jitsi-find-participants-avatar" type="button" aria-label="${escapeHtml(i18n.t("module.jitsi_meet.participants.search"))}" title="${escapeHtml(i18n.t("module.jitsi_meet.participants.search"))}">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9.1 9a3 3 0 1 1 4.83 2.38c-1.07.8-1.93 1.42-1.93 2.62v.4M12 18h.01" /></svg>
            </button>
          </div>
        </div>
        <div class="jitsi-participants-grid-column jitsi-persisted-meetings-column">
          <p class="jitsi-participants-pool-label">${escapeHtml(i18n.t("module.jitsi_meet.participants.persisted_meetings"))}</p>
          <div id="jitsi-persisted-meetings" class="jitsi-persisted-meetings" role="list"></div>
        </div>
      </div>
    </section>
  `;
}
