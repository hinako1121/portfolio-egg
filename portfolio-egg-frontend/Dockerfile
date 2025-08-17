FROM node:18-alpine as builder

# アプリケーションディレクトリを作成
WORKDIR /app

# package.jsonをコピーして依存関係をインストール
COPY package*.json ./
RUN npm ci

# ソースコードをコピー
COPY . .

# ビルド
RUN npm run build

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