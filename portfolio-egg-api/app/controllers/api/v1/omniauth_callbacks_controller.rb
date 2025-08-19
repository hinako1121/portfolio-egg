class Api::V1::OmniauthCallbacksController < DeviseTokenAuth::OmniauthCallbacksController
  protected

  def get_resource_from_auth_hash
    # GitHub認証情報から必要な情報を取得
    @resource = resource_class.where({
      uid: auth_hash['uid'],
      provider: auth_hash['provider']
    }).first

    if @resource
      @resource
    else
      # 新規ユーザーの場合は作成
      @resource = resource_class.new({
        uid: auth_hash['uid'],
        provider: auth_hash['provider'],
        email: auth_hash['info']['email'],
        username: auth_hash['info']['login'] || auth_hash['info']['name'],
        name: auth_hash['info']['name'],
        github_url: auth_hash['info']['html_url']
      })

      # パスワードは自動生成（GitHub認証では不要）
      @resource.password = Devise.friendly_token[0, 20]
      @resource.password_confirmation = @resource.password

      @resource.save!
      @resource
    end
  end

  def render_data_or_redirect(message, data, user_data = {})
    # フロントエンドにリダイレクトして認証情報を渡す
    frontend_url = ENV.fetch('FRONTEND_ORIGIN', 'http://localhost:5173')
    
    if @resource.persisted?
      # 認証成功時
      token_data = @resource.create_new_auth_token
      redirect_url = "#{frontend_url}/auth/callback?token=#{token_data['access-token']}&client=#{token_data['client']}&uid=#{token_data['uid']}&provider=github"
    else
      # 認証失敗時
      redirect_url = "#{frontend_url}/auth/failure?provider=github"
    end
    
    redirect_to redirect_url, allow_other_host: true
  end
end 