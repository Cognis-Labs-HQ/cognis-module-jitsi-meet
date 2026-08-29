# 共有ゲストの Whiteboard アクセス

**機能ブランチ:** work

## ミーティングに限定されたゲスト状態を認可

Whiteboard 状態の更新では、共有リンクのゲストを要求対象のミーティングに対して Share ゲートウェイで検証し、合意投票にミーティング在席と同じ安定した合成 ID を使用するようになりました。

## ホストが作成した Whiteboard を再利用

共有リンクのゲストはミーティングの既存 Whiteboard 関連付けを使用し、関連付けがない場合は認可済みアカウントまたはホストによる作成を待つようになりました。

## 委任 Whiteboard 関連付けを提供

Jitsi Meet は `meetings:resolveWhiteboardAssociation` を公開するようになりました。要求されたボードが信頼できるミーティング状態と完全に一致し、実際の Share ゲストクレームがそのミーティングに対して認可されている場合にのみ、アクティブなミーティングを返します。関連付けがない、非アクティブ、終了済み、曖昧、不一致の場合は拒否します。

## 肥大化したモジュールを分割

スキーマ作成と認証情報のバックフィルを専用のストアスキーマモジュールへ移し、UI 回帰テストをまとまりのある2つのファイルへ分割し、宣言とメソッド間の通常の空白を復元しました。

## コミット

- [afbb29a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/afbb29a0276ea2f9a870b3f50429448a0db04a8c)
- [777e683](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/777e6839d246ceffe0d999227554c85da8b0f103)
- [88e72f2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/88e72f2b8ceb38fd137d22d97ab2749bc4a1e2bb)
- [c0f05fb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c0f05fb22382b2f18b2ecbacee654a6007944b78)
