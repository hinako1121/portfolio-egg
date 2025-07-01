# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

now = Time.current

animals = [
  ["イヌ", "dog", "🐶 好奇心旺盛なバックエンドエンジニア。RubyとRailsが大好きです！"],
  ["ネコ", "cat", "🐱 フロントエンド担当。ReactとCSSでUIを磨くのが好きです。"],
  ["トリ", "bird", "🐦 Webとクラウドに強いエンジニア。GCPとFirebaseをよく使います。"],
  ["ウサギ", "rabbit", "🐰 デザインと実装の橋渡しをするUI/UXエンジニアです。"],
  ["タヌキ", "raccoon", "🦝 初心者でも安心して開発できる環境づくりに情熱を注いでいます。"],
  ["キツネ", "fox", "🦊 アルゴリズムとデータ構造が得意なロジック派エンジニア。"],
  ["クマ", "bear", "🐻 テストとCI/CDにこだわる品質重視タイプです。"],
  ["サル", "monkey", "🐵 アイデア豊富なハッカソン常連エンジニア。"],
  ["パンダ", "panda", "🐼 RailsとPostgreSQLでの開発経験が豊富です。"],
  ["ゾウ", "elephant", "🐘 インフラとセキュリティを支える縁の下の力持ちです。"]
]

animals.each do |name_jp, eng, bio|
  User.create!(
    provider: "email",
    uid: "#{eng}@user.com",
    email: "#{eng}@user.com",
    password: "#{eng}user",
    password_confirmation: "#{eng}user",
    name: name_jp,
    username: eng,
    bio: bio,
    github_url: "https://example.com",
    twitter_url: "https://example.com",
    confirmed_at: now,
    confirmation_sent_at: now
  )
end
