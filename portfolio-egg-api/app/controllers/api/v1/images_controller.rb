class Api::V1::ImagesController < ApplicationController
  def show
    begin
      # signed_idからblobを取得
      blob = ActiveStorage::Blob.find_signed(params[:signed_id])
      
      if blob.present?
        # Google Cloud Storageの直接URLを生成（署名付きURL）
        if Rails.env.production?
          # 署名付きURLを生成（1時間有効）
          signed_url = blob.url(expires_in: 1.hour)
          redirect_to signed_url, status: :found, allow_other_host: true
        else
          # 開発環境では通常のActive StorageのURLを使用
          redirect_to url_for(blob), status: :found, allow_other_host: true
        end
      else
        head :not_found
      end
    rescue ActiveRecord::RecordNotFound, ActiveSupport::MessageVerifier::InvalidSignature
      head :not_found
    rescue Google::Cloud::Error => e
      Rails.logger.error "Google Cloud Storage error: #{e.message}"
      # Google Cloud Storageエラーの場合、フロントエンドのプレースホルダー画像にリダイレクト
      redirect_to "#{ENV.fetch('FRONTEND_ORIGIN', 'http://localhost:5173')}/placeholder.svg", status: :found, allow_other_host: true
    rescue => e
      Rails.logger.error "Image controller error: #{e.message}"
      # その他のエラーの場合もフロントエンドのプレースホルダー画像にリダイレクト
      redirect_to "#{ENV.fetch('FRONTEND_ORIGIN', 'http://localhost:5173')}/placeholder.svg", status: :found, allow_other_host: true
    end
  end
end 