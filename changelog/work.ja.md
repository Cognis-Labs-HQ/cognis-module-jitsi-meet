# 使い捨て Jitsi ミーティングによる Messages ビデオ通話

**機能ブランチ:** work

## Messages から制限付き通話を開始

Jitsi Meet がダイレクトチャットとグループチャット向けのブラウザー VoIP プロバイダーを提供するようになりました。通話には開始元ルームのメンバーだけが含まれ、別のミーティングチャットは作成されません。

## 通話を使い捨てかつ集中した状態に維持

Messages 通話は共有、参加者の追加、Whiteboard との接続ができません。Messages に戻っても、進行中のミーティングは移動可能なピクチャーインピクチャーウィンドウで維持され、通話終了時にミーティング記録が削除されます。

## 初回描画からプロバイダーを利用可能に

ナビゲーションバー登録で `voip:startCall` を宣言するようになりました。これにより、Messages がプロバイダーの利用可否を確認する前に Cognis が Jitsi を読み込み、初回のチャット描画からビデオカメラ操作を表示できます。

## ルーム単位のホスト所有通話アクション

Jitsi はステージを自ら作成してマウントする代わりに、各ルーム要求を正規化された `component` アクションへ解決するようになりました。最新のプロバイダー契約に従い、コンポーネントの生成、クリーンアップ、起動結果の通知は Cognis Messages が所有します。

## コミット

- [3bd6d6a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3bd6d6a16b4b495f91dbf1f7e55e7aa86d1381fd)
- [b68432b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b68432b0f3db343ef0db7d706aeaad5000063e96)
