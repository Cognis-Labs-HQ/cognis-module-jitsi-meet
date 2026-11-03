# 会議の作成

**機能ブランチ:** fix-meeting-creation-capability

## プロバイダーが所有する会議作成

ブラウザーの `meetings:createMeeting({ participants, scheduledAt, signal })` は `{ meetingId, navigationUrl }` を返します。プロバイダーが HTTP 要求と遷移先を所有し、ホストの `ui:scopedActions` 契約を通じて `jitsi-meet:creation:create` を実行します。利用側はモジュールのエンドポイントを組み立てず、この任意の機能を検出します。認証と検証は既存の API 境界で行います。中止または削除されたプロバイダーは、それ以降の操作を実行できません。

## コミット

- [aca37ed](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/aca37edcbfad8b47d2ad5df47a5d4e878c8c0111)
