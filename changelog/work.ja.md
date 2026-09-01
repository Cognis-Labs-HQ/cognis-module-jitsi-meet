# ミーティングチャットのメンバー管理を整合

**機能ブランチ:** work

## 正規の Messages メンバーシップ capability を使用

進行中のミーティングへの招待と参加者の削除で、正規の実行者アカウント ID とユーザーアカウント ID を指定する統一された `social:messages:membership` capability を使用し、現在の Cognis Messages 統合契約に準拠しました。

## 再参加時にチャットアクセスを復元

認証済みユーザーがミーティングへ参加するたびに、チャットを読み込む前に冪等な Messages メンバーシップ操作を再適用します。以前ミーティングチャットを退出またはアーカイブした参加者も、ミーティングへ再参加するとチャットを再び表示できます。

## コミット

- [d6f689a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d6f689a8d46f17897c4d1abf65f93673e99b4b30)

- [8665186](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/86651863fcf6af7736904af8c01f7cc89d5a45de)
