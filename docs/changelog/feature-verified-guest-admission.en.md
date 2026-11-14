# Verified guest admission

**Feature branch:** `feature-verified-guest-admission`

## Verified guest admission

Meeting resource routes obtain verified guest claims through `share:getGuestClaims` before applying the existing meeting and capability checks. The complete claims reach Share through `ctx`; a subject beginning with `share:` does not identify a guest. Missing, revoked or expired credentials and grants do not fall back to account access. Account and management routes remain session-only, including pending-session restrictions.

The module requires Share’s verified guest admission, guest identity and resource authorization capabilities. Install the matching Auth/Share host contract before this module. Mixed guest routes authenticate in their handlers rather than using the host’s session-only route guard; they still authorize each target meeting. Existing Whiteboard delegation and meeting join checks remain in force.

Guest startup loads UI resources and checks Whiteboard availability only for the authorized meeting, carrying the credential in request context rather than the URL. Existing guest meetings do not run the account-only global preflight. Guest payloads never inherit the creator’s authentication controls; the meeting password remains limited to the existing authorized join response.

## Commits

- [ea6b331](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ea6b331722d3b7f709431a9b30c4e6cb1e517ee5)
