# Portfolio Egg 🥚

**Portfolio Egg**は、開発者が自分のアプリケーションを投稿・共有し、他の開発者からフィードバックを受けられるプラットフォームです。

## 🌐 本番環境

- **フロントエンド**: https://portfolio-egg-frontend-258631948423.asia-northeast1.run.app

## 📋 目次

- [機能](#機能)
- [技術スタック](#技術スタック)
- [アーキテクチャ](#アーキテクチャ)
- [開発環境セットアップ](#開発環境セットアップ)
- [デプロイメント](#デプロイメント)
- [API仕様](#api仕様)
- [認証](#認証)
- [環境変数](#環境変数)

## ✨ 機能

### 👤 ユーザー機能
- **認証システム**: 新規登録・ログイン・ログアウト
- **プロフィール管理**: プロフィール画像・自己紹介・スキル設定
- **セキュアな認証**: JWT Token認証（Devise Token Auth）

### 📱 アプリケーション管理
- **アプリ投稿**: アプリケーションの詳細情報・スクリーンショット・デモURL登録
- **バージョン管理**: アプリケーションの複数バージョン対応
- **カテゴリ分類**: アプリケーションのカテゴリ別整理
- **検索・フィルタリング**: カテゴリやキーワードでの検索

### 💬 フィードバック機能
- **コメント投稿**: アプリケーションに対するフィードバック
- **バージョン別フィードバック**: 特定のバージョンへのコメント
- **リアルタイム更新**: 最新のフィードバックを即座に反映

### 🎨 UI/UX
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- **モダンUI**: Tailwind CSS + Radix UIによる美しいインターフェース
- **アクセシビリティ**: WAI-ARIA準拠のアクセシブルな設計

## 🛠️ 技術スタック

### フロントエンド
- **React 19** - UIライブラリ
- **TypeScript** - 型安全な開発
- **Vite 7.0** - 高速ビルドツール
- **Tailwind CSS** - ユーティリティファーストCSS
- **Radix UI** - アクセシブルなUIコンポーネント
- **Lucide React** - アイコンライブラリ
- **Axios** - HTTP通信ライブラリ

### バックエンド
- **Ruby on Rails 8.0.2** - APIサーバー（APIモード）
- **PostgreSQL** - メインデータベース
- **Devise Token Auth** - JWT認証システム
- **Active Storage** - ファイルアップロード機能
- **Puma** - Webサーバー
- **Rack CORS** - CORS設定

### インフラストラクチャ
- **Google Cloud Platform (GCP)**
  - **Cloud Run** - サーバーレスコンテナホスティング
  - **Cloud SQL** - マネージドPostgreSQLデータベース
  - **Cloud Storage** - オブジェクトストレージ
  - **Secret Manager** - 機密情報管理
  - **Cloud Build** - CI/CDパイプライン
  - **Artifact Registry** - コンテナイメージ管理

### 開発・デプロイツール
- **Docker** - コンテナ化
- **Nginx** - 静的ファイル配信（フロントエンド）
- **Git** - バージョン管理

## 🏗️ アーキテクチャ

```
┌─────────────────┐    HTTPS     ┌─────────────────┐
│                 │◄────────────►│                 │
│   React SPA     │              │   Rails API     │
│  (Cloud Run)    │              │  (Cloud Run)    │
│                 │              │                 │
└─────────────────┘              └─────────────────┘
                                           │
                                           │
                                           ▼
                                 ┌─────────────────┐
                                 │                 │
                                 │  PostgreSQL     │
                                 │  (Cloud SQL)    │
                                 │                 │
                                 └─────────────────┘
                                           │
                                           │
                                           ▼
                                 ┌─────────────────┐
                                 │                 │
                                 │ Cloud Storage   │
                                 │ (File Upload)   │
                                 │                 │
                                 └─────────────────┘
```

### データフロー
1. **ユーザーアクセス** → フロントエンド（Cloud Run）
2. **API通信** → Rails API（Cloud Run）
3. **データベース操作** → PostgreSQL（Cloud SQL）
4. **ファイルアップロード** → Cloud Storage

## 🚀 開発環境セットアップ

### 前提条件
- Ruby 3.2+
- Node.js 20+
- PostgreSQL 15+
- Git

### 1. リポジトリクローン
```bash
git clone https://github.com/your-username/portfolio-egg.git
cd portfolio-egg
```

### 2. バックエンドセットアップ
```bash
cd portfolio-egg-api

# 依存関係インストール
bundle install

# データベース作成・マイグレーション
rails db:create
rails db:migrate
rails db:seed

# サーバー起動
rails server -p 3000
```

### 3. フロントエンドセットアップ
```bash
cd portfolio-egg-frontend

# 依存関係インストール
npm install

# 環境変数設定
echo "VITE_API_URL=http://localhost:3000" > .env.local

# 開発サーバー起動
npm run dev
```

### 4. アクセス
- **フロントエンド**: http://localhost:5173
- **API**: http://localhost:3000

## 🚀 デプロイメント

### Google Cloud Platform デプロイ

#### 前提条件
- Google Cloud アカウント
- gcloud CLI インストール済み
- 課金アカウント有効

#### 1. GCPプロジェクト設定
```bash
# プロジェクト設定
export PROJECT_ID="your-project-id"
export REGION="asia-northeast1"
gcloud config set project $PROJECT_ID

# API有効化
gcloud services enable run.googleapis.com
gcloud services enable sql-component.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable storage-component.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

#### 2. インフラ作成
```bash
# Cloud SQL インスタンス作成
gcloud sql instances create portfolio-egg-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION

# データベース作成
gcloud sql databases create portfolio_egg_production --instance=portfolio-egg-db

# ユーザー作成
gcloud sql users create portfolio_user --instance=portfolio-egg-db --password=your-password

# Cloud Storage バケット作成
gsutil mb gs://portfolio-egg-storage

# Artifact Registry リポジトリ作成
gcloud artifacts repositories create portfolio-egg-repo \
  --repository-format=docker \
  --location=$REGION
```

#### 3. シークレット管理
```bash
# Rails master key をSecret Managerに保存
gcloud secrets create rails-master-key --data-file=portfolio-egg-api/config/master.key

# データベースパスワードを保存
echo "your-db-password" | gcloud secrets create db-password --data-file=-
```

#### 4. デプロイ実行
```bash
# Rails API デプロイ
gcloud builds submit --config cloudbuild-api.yaml

# React フロントエンド デプロイ
gcloud builds submit --config cloudbuild-frontend.yaml
```

#### 5. アクセス権限設定
```bash
# パブリックアクセス許可
gcloud run services add-iam-policy-binding portfolio-egg-api \
  --region=$REGION --member="allUsers" --role="roles/run.invoker"

gcloud run services add-iam-policy-binding portfolio-egg-frontend \
  --region=$REGION --member="allUsers" --role="roles/run.invoker"
```

## 📡 API仕様

### ベースURL
- **本番**: https://portfolio-egg-api-258631948423.asia-northeast1.run.app
- **開発**: http://localhost:3000

### 主要エンドポイント

#### 認証
```
POST /api/v1/auth/sign_in          # ログイン
POST /api/v1/auth/sign_up          # 新規登録
DELETE /api/v1/auth/sign_out       # ログアウト
```

#### ユーザー
```
GET /api/v1/users/profile          # プロフィール取得
PUT /api/v1/users/profile          # プロフィール更新
```

#### アプリケーション
```
GET /api/v1/apps                   # アプリ一覧
POST /api/v1/apps                  # アプリ作成
GET /api/v1/apps/:id               # アプリ詳細
PUT /api/v1/apps/:id               # アプリ更新
DELETE /api/v1/apps/:id            # アプリ削除
```

#### フィードバック
```
GET /api/v1/apps/:app_id/feedbacks    # フィードバック一覧
POST /api/v1/apps/:app_id/feedbacks   # フィードバック作成
```

### レスポンス形式
```json
{
  "success": true,
  "data": {
    // レスポンスデータ
  },
  "message": "Success message"
}
```

## 🔐 認証

### JWT Token認証
- **方式**: Bearer Token
- **ヘッダー**: `Authorization: Bearer <token>`
- **有効期限**: 2週間
- **リフレッシュ**: 自動更新

### 認証フロー
1. **ログイン** → JWT Token取得
2. **API リクエスト** → Authorizationヘッダーに Token設定
3. **Token 検証** → サーバーサイドで検証
4. **レスポンス** → 認証済みデータ返却

## 🌍 環境変数

### フロントエンド (.env)
```env
VITE_API_URL=https://portfolio-egg-api-258631948423.asia-northeast1.run.app
```

### バックエンド (環境変数)
```env
# 本番環境
RAILS_ENV=production
RAILS_LOG_TO_STDOUT=true

# データベース
PRODUCTION_DB_NAME=portfolio_egg_production
PRODUCTION_DB_USERNAME=portfolio_user
PRODUCTION_DB_PASSWORD=<Secret Manager>
CLOUD_SQL_CONNECTION_NAME=project:region:instance

# Google Cloud
GOOGLE_PROJECT_ID=your-project-id
STORAGE_BUCKET_NAME=portfolio-egg-storage

# Rails
RAILS_MASTER_KEY=<Secret Manager>