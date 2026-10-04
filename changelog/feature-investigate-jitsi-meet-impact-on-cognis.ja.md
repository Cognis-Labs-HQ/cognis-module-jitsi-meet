# Jitsi ミーティング参加の信頼性を回復

**機能ブランチ:** feature-investigate-jitsi-meet-impact-on-cognis

## 期限切れの Jitsi 認証セッションを破棄

Meetings は、その他すべての Jitsi 設定を保持したまま、埋め込み会議を作成する前にキャッシュされた Jitsi 認証セッション ID を削除するようになりました。これにより、Jicofo の再起動やセッション期限切れが、`session-invalid` 会議要求の繰り返しやブリッジチャネルの切断を引き起こすことを防ぎます。

## ストレージなしでも参加可能にする

ブラウザーポリシーや不透明なオリジンにより、`localStorage` へのアクセスが拒否される場合があります。Meetings はプロパティーアクセスとストレージ操作の両方の失敗を捕捉し、構造化ログにフォールバックを記録して、セッションを消去せずに Jitsi iframe の作成を続行します。

## コミット

- [04158e4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/04158e4a2da493d1413d5bbb7f580e0066cac468)
- [e804261](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e8042612c8e55a549db7aa32cbc8ab9e0d1cdd04)
