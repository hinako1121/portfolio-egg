module Api
  module V1
    class AppVersionsController < ApplicationController
      before_action :authenticate_api_v1_user!, except: [:show]
      before_action :set_app, only: [:index, :create]
      before_action :set_app_version, only: [:show]

      def index
        versions = @app.app_versions.order(release_date: :desc)
        render json: versions
      end

      def show
        render json: @app_version.as_json(include: { 
          feedbacks: { 
            include: { user: { only: [:id, :username] } }
          }
        })
      end

      def create
        # まずアプリ情報を更新
        app_update_success = @app.update(app_params)
        version = @app.app_versions.new(app_version_params.merge(release_date: Date.current))
        version_success = version.save

        if app_update_success && version_success
          render json: version, status: :created
        else
          errors = []
          errors += @app.errors.full_messages unless app_update_success
          errors += version.errors.full_messages unless version_success
          render json: { errors: errors }, status: :unprocessable_entity
        end
      end

      private

      def set_app
        @app = current_api_v1_user.apps.find(params[:app_id])
      end

      def set_app_version
        @app_version = AppVersion.find(params[:id])
      end

      def app_version_params
        params.require(:app_version).permit(:version_number, :changelog)
      end

      def app_params
        params.fetch(:app, {}).permit(:title, :description, :category, :github_url, :deploy_url, :thumbnail_image)
      end
    end
  end
end
