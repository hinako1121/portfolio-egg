FROM node:20-alpine as builder

# アプリケーションディレクトリを作成
WORKDIR /app

# package.jsonをコピーして依存関係をインストール
COPY package*.json ./
RUN npm ci

# ソースコードをコピー
COPY . .

# ビルド引数を環境変数として設定
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Firebase環境変数
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID

ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

# ビルド（TypeScriptチェックをスキップ）
RUN npx vite build --mode production

# 本番用のNginxイメージ
FROM nginx:alpine

# ビルドしたファイルをコピー
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginxの設定をコピー
COPY nginx.conf /etc/nginx/nginx.conf

# ポート設定
EXPOSE 8080

# Nginx起動
CMD ["nginx", "-g", "daemon off;"] 