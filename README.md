# 🥚 Portfolio Egg

**Portfolio Egg**は、開発者が自分のアプリケーションを投稿し、他の開発者からフィードバックを受け取ることができるプラットフォームです。

## 📋 概要

Portfolio Eggは以下の機能を提供します：

- **アプリ投稿**: 自分が開発したアプリケーションを投稿
- **バージョン管理**: アプリの複数バージョンを管理
- **フィードバック機能**: 他の開発者からの評価とコメントを受け取り
- **カテゴリ分類**: Webアプリ、モバイルアプリ、ゲームなどのカテゴリ別表示
- **ユーザープロフィール**: GitHub、Twitterなどのソーシャルリンク
- **認証システム**: ユーザー登録・ログイン機能

## 🏗️ アーキテクチャ

このプロジェクトは以下の構成になっています：

- **Backend API**: Ruby on Rails 8.0.2 (APIモード)
- **Frontend**: React 19 + TypeScript + Vite
- **Database**: PostgreSQL
- **UI Framework**: Tailwind CSS + Radix UI
- **認証**: Devise Token Auth

```
portfolio-egg/
├── portfolio-egg-api/     # Rails API バックエンド
└── portfolio-egg-frontend/ # React フロントエンド
```

## 🚀 セットアップ

### 前提条件

以下がインストールされている必要があります：

- **Ruby**: 3.2.0以上
- **Node.js**: 18.0以上
- **PostgreSQL**: 14以上
- **Bundler**: `gem install bundler`

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd portfolio-egg
```

### 2. データベースのセットアップ

PostgreSQLサーバーが起動していることを確認してから：

```bash
# 環境変数を設定（.envファイルまたはシェル）
export DATABASE_USERNAME=your_postgres_user
export DATABASE_PASSWORD=your_postgres_password
```

### 3. バックエンド（Rails API）のセットアップ

```bash
cd portfolio-egg-api

# 依存関係のインストール
bundle install

# データベースの作成とマイグレーション
rails db:create
rails db:migrate
rails db:seed

# サーバー起動（ポート3000）
rails server
```

### 4. フロントエンドのセットアップ

新しいターミナルウィンドウで：

```bash
cd portfolio-egg-frontend

# 依存関係のインストール
npm install

# 開発サーバー起動（ポート5173）
npm run dev
```

### 5. アプリケーションにアクセス

- **フロントエンド**: http://localhost:5173
- **API**: http://localhost:3000
- **API ドキュメント**: http://localhost:3000/api-docs

## 🛠️ 開発コマンド

### バックエンド（Rails API）

```bash
cd portfolio-egg-api

# サーバー起動
rails server

# テスト実行
rails test

# コンソール
rails console

# データベースリセット
rails db:reset

# マイグレーション
rails db:migrate

# Linter実行
bundle exec rubocop
```

### フロントエンド（React）

```bash
cd portfolio-egg-frontend

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview

# Linter実行
npm run lint
```

## 📊 データベース構造

主要なテーブル：

- **users**: ユーザー情報（認証、プロフィール）
- **apps**: アプリケーション情報
- **app_versions**: アプリのバージョン履歴
- **feedbacks**: フィードバック・評価

## 🔧 主要な技術スタック

### バックエンド
- **Ruby on Rails 8.0.2** - APIフレームワーク
- **PostgreSQL** - データベース
- **Devise Token Auth** - 認証
- **Active Storage** - ファイルアップロード
- **Puma** - Webサーバー

### フロントエンド
- **React 19** - UIライブラリ
- **TypeScript** - 型安全性
- **Vite** - ビルドツール
- **Tailwind CSS** - スタイリング
- **Radix UI** - UIコンポーネント
- **React Router** - ルーティング
- **Axios** - HTTP クライアント

## 📱 主要機能

### ユーザー機能
- ユーザー登録・ログイン
- プロフィール編集（GitHub、Twitter連携）
- マイアプリ一覧

### アプリ管理
- アプリ投稿（タイトル、説明、カテゴリ、サムネイル）
- バージョン管理（複数バージョンの履歴）
- アプリ編集・削除

### フィードバック機能
- 5段階評価（デザイン、使いやすさ、創造性、有用性、総合）
- コメント投稿
- バージョン別フィードバック表示

### 表示機能
- アプリ一覧（カテゴリ別フィルタ）
- アプリ詳細ページ
- フィードバック統計表示

## 🔒 認証

このアプリケーションはDevise Token Authを使用してJWTベースの認証を実装しています。

認証が必要なエンドポイント：
- アプリの投稿・編集・削除
- フィードバックの投稿
- プロフィール編集

## 🚀 デプロイ

### 本番環境への設定

1. 環境変数の設定
2. データベースの設定
3. Rails アセットのプリコンパイル
4. フロントエンドのビルド

詳細なデプロイ手順は各環境に応じて設定してください。

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは[MIT License](LICENSE)の下で公開されています。

## 📞 サポート

問題や質問がある場合は、GitHubのIssueを作成してください。 