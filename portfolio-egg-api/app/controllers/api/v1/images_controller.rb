class Api::V1::ImagesController < ApplicationController
  def show
    begin
      # signed_idからblobを取得
      blob = ActiveStorage::Blob.find_signed(params[:signed_id])

      if blob.present?
        if Rails.env.production?
          # 公開URLを直接生成（認証不要）
          public_url = "https://storage.googleapis.com/#{ENV['STORAGE_BUCKET_NAME']}/#{blob.key}"
          redirect_to public_url, status: :found, allow_other_host: true
        else
          # 開発環境では通常のActive StorageのURLを使用
          redirect_to url_for(blob), status: :found, allow_other_host: true
        end
      else
        head :not_found
      end
    rescue ActiveRecord::RecordNotFound, ActiveSupport::MessageVerifier::InvalidSignature
      head :not_found
    rescue => e
      Rails.logger.error "Image controller error: #{e.message}"
      # エラーの場合はフロントエンドのプレースホルダー画像にリダイレクト
      redirect_to "#{ENV.fetch('FRONTEND_ORIGIN', 'http://localhost:5173')}/placeholder.svg", status: :found, allow_other_host: true
    end
  end
end 