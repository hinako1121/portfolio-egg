# Google Cloud認証の設定
if Rails.env.production?
  # Cloud Runでのメタデータサーバー認証を明示的に設定
  ENV['GOOGLE_CLOUD_PROJECT'] ||= ENV['GOOGLE_PROJECT_ID']
  
  # Active StorageのGoogle Cloud Storage設定を明示的に初期化
  Rails.application.config.after_initialize do
    # Google Cloud Storageクライアントの認証設定
    require 'google/cloud/storage'
    Google::Cloud::Storage.configure do |config|
      config.project_id = ENV['GOOGLE_PROJECT_ID']
      # Cloud Runのメタデータサーバーから認証情報を取得
      config.credentials = nil
    end
  end
end 