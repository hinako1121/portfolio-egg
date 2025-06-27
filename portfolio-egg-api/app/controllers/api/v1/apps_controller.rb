module Api
  module V1
    class AppsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_app, only: [:show, :update, :destroy]

      def index
        @apps = current_user.apps
        render json: @apps
      end

      def show
        data = @app.as_json
        data[:thumbnail_url] = url_for(@app.thumbnail_image) if @app.thumbnail_image.attached?
        render json: data
      end
      

      def create
        @app = current_user.apps.new(app_params)
        if @app.save
          render json: @app, status: :created
        else
          render json: { errors: @app.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @app.update(app_params)
          render json: @app
        else
          render json: { errors: @app.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @app.destroy
        head :no_content
      end

      private

      def set_app
        @app = current_user.apps.find(params[:id])
      end

      def app_params
        params.require(:app).permit(:title, :description, :thumbnail, :category, :github_url, :deploy_url, :thumbnail_image)
      end
    end
  end
end
