# Google Cloud認証の設定
if Rails.env.production?
  # Cloud Runでのメタデータサーバー認証を明示的に設定
  ENV['GOOGLE_CLOUD_PROJECT'] ||= ENV['GOOGLE_PROJECT_ID']
  
  # Active Storageが確実にGoogle Cloud認証を使用するように設定
  Rails.application.config.after_initialize do
    if defined?(Google::Cloud)
      Google::Cloud.configure do |config|
        config.project_id = ENV['GOOGLE_PROJECT_ID']
        # Cloud Runのメタデータサーバーから認証情報を取得
        config.credentials = nil # デフォルト認証を使用
      end
    end
  end
end 