Rails.application.routes.draw do
  mount Rswag::Ui::Engine => '/api-docs'
  mount Rswag::Api::Engine => '/api-docs'
  
  root to: proc { [200, { 'Content-Type' => 'application/json' }, [{ message: 'Rails API' }.to_json]] }

    get "/ping", to: ->(_) { [200, {}, ["pong"]] }
  
  # Active Storage画像アクセス用のカスタムルート
  get '/rails/active_storage/blobs/redirect/:signed_id/*filename', to: 'api/v1/images#show'
  
  namespace :api do
    namespace :v1 do
      mount_devise_token_auth_for 'User', at: 'auth'
      
      # アプリ関連
      resources :apps, only: [:index, :show, :create, :update, :destroy] do
        resources :app_versions, only: [:index, :create]
      end
      
      # バージョン関連
      resources :app_versions, only: [:show] do
        resources :feedbacks, only: [:index, :create] do
          collection do
            get :my_feedback
          end
        end
      end
      
      # ユーザー関連
      get '/my-apps', to: 'apps#my_apps'
      get '/profile', to: 'users#profile'
      patch '/profile', to: 'users#update_profile'
    end
  end
end