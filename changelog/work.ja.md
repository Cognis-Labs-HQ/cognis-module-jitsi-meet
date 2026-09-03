# 使い捨て Jitsi ミーティングによる Messages ビデオ通話

**機能ブランチ:** work

## Messages から制限付き通話を開始

Jitsi Meet がダイレクトチャットとグループチャット向けのブラウザー VoIP プロバイダーを提供するようになりました。通話には開始元ルームのメンバーだけが含まれ、別のミーティングチャットは作成されません。

## 通話を使い捨てかつ集中した状態に維持

Messages 通話は共有、参加者の追加、Whiteboard との接続ができません。Messages に戻っても、進行中のミーティングは移動可能なピクチャーインピクチャーウィンドウで維持され、通話終了時にミーティング記録が削除されます。

## コミット

- [d5aea92](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d5aea921e1cc515bda0859dae2e20b135e18cb72)
- [54ef696](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/54ef6968d5dcde30b2e2c5de28c0b845d95188ba)
