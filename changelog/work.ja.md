# 共有ゲストの Whiteboard アクセス

**機能ブランチ:** work

## ミーティングに限定されたゲスト状態を認可

Whiteboard 状態の更新では、共有リンクのゲストを要求対象のミーティングに対して Share ゲートウェイで検証し、合意投票にミーティング在席と同じ安定した合成 ID を使用するようになりました。

## ホストが作成した Whiteboard を再利用

共有リンクのゲストはミーティングの既存 Whiteboard 関連付けを使用し、関連付けがない場合は認可済みアカウントまたはホストによる作成を待つようになりました。

## コミット

- [52ed541](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/52ed541e59bb4dac0ef6736e184061da4c533790)
