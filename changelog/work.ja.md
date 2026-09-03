# 使い捨て Jitsi ミーティングによる Messages ビデオ通話

**機能ブランチ:** work

## Messages から制限付き通話を開始

Jitsi Meet がダイレクトチャットとグループチャット向けのブラウザー VoIP プロバイダーを提供するようになりました。通話には開始元ルームのメンバーだけが含まれ、別のミーティングチャットは作成されません。

## 通話を使い捨てかつ集中した状態に維持

Messages 通話は共有、参加者の追加、Whiteboard との接続ができません。Messages に戻っても、進行中のミーティングは移動可能なピクチャーインピクチャーウィンドウで維持され、通話終了時にミーティング記録が削除されます。

## 初回描画からプロバイダーを利用可能に

ナビゲーションバー登録で `voip:startCall` を宣言するようになりました。これにより、Messages がプロバイダーの利用可否を確認する前に Cognis が Jitsi を読み込み、初回のチャット描画からビデオカメラ操作を表示できます。

## コミット

- [39f6fde](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/39f6fde4a0a48b73f1ff77259ae47ea15c125049)
- [4800983](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/4800983502abcdd530a34419f6fe8ae6ead042f1)
