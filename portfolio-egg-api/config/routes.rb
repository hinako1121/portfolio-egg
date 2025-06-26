Rails.application.routes.draw do
  mount_devise_token_auth_for 'User', at: 'auth'
  mount Rswag::Ui::Engine => '/api-docs'
  mount Rswag::Api::Engine => '/api-docs'
  root to: proc { [200, { 'Content-Type' => 'application/json' }, [{ message: 'Rails API' }.to_json]] }

  get "/ping", to: ->(_) { [200, {}, ["pong"]] }
end