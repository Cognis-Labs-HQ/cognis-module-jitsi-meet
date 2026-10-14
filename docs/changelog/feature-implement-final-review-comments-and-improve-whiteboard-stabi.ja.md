# 安定したミーティング Whiteboard

**機能ブランチ:** feature-implement-final-review-comments-and-improve-whiteboard-stabi

## Whiteboard の状態をミーティングセッション内に限定

ミーティングを開始しただけでは永続キャンバスを開かなくなりました。ミーティングの終了または再開時にオープン状態を解除し、参加者はアクティブなセッションで明示的に開かれたキャンバスだけをマウントします。

## コンポーネントのマウントを予測可能に

コンポーネントページはミーティングのマウントごとに一度だけ要求し、マウントの再試行回数を制限します。キーリングへのアクセスまたはマウントを待つ間、Whiteboard コントロールは通常のラベルのまま無効になり、マウント成功後にのみ「Whiteboard を閉じる」へ変わり、古い非同期ウィンドウは誤解を招く失敗トーストを表示せず破棄します。

## リリース情報の出所を Cognis に整合

このプルリクエストでは、機能ブランチ名を付けた1組のローカライズ済み Changelog だけを使用します。各変更にはリリース概要の見出しと詳細本文を設け、その後に実装コミットへの完全なリポジトリリンクを記載し、Cognis core と隣接する外部モジュールに合わせています。

## コミット

- [7141534](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/7141534703ebe3f38581e748172c38e5e990baa6)
- [12ad748](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/12ad7488915d047a891307f37b16964c2c239f42)
- [b1d430d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b1d430d91e19abe31a348f9749dc386df07c6a6c)
- [fe48d89](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/fe48d89a5447460c40f45dc4192962c2b6b2d554)
- [6d87f99](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6d87f998c14b17fa4f3a567d86fd64279b79379b)
