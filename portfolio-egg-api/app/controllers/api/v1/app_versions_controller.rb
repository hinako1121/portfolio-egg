module Api
  module V1
    class AppVersionsController < ApplicationController
      before_action :authenticate_user!, except: [:show]
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
        version = @app.app_versions.new(app_version_params)
        if version.save
          render json: version, status: :created
        else
          render json: { errors: version.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_app
        @app = current_user.apps.find(params[:app_id])
      end

      def set_app_version
        @app_version = AppVersion.find(params[:id])
      end

      def app_version_params
        params.require(:app_version).permit(:version_number, :changelog)
      end
    end
  end
end
