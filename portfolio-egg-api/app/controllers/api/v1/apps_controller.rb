module Api
  module V1
    class AppsController < ApplicationController
      before_action :authenticate_user!, except: [:index, :show]
      before_action :set_app, only: [:show, :update, :destroy]

      # GET /api/v1/apps
      def index
        apps = App.includes(:user, :app_versions, thumbnail_image_attachment: :blob)

        # カテゴリフィルター
        apps = apps.where(category: params[:category]) if params[:category].present? && params[:category] != 'all'

        # キーワード検索（タイトル or 説明）
        if params[:q].present?
          keyword = "%#{params[:q]}%"
          apps = apps.where("title ILIKE ? OR description ILIKE ?", keyword, keyword)
        end

        # 並び替え
        case params[:sort]
        when 'popular'
          apps = apps.left_joins(app_versions: :feedbacks)
                     .group('apps.id')
                     .order('AVG(feedbacks.overall_score) DESC NULLS LAST')
        when 'feedback'
          apps = apps.left_joins(app_versions: :feedbacks)
                     .group('apps.id')
                     .order('COUNT(feedbacks.id) DESC')
        when 'newest'
        default
          apps = apps.order(created_at: :desc)
        end

        apps_json = apps.map do |app|
          latest_version = app.app_versions.order(release_date: :desc).first
          feedback_count = app.app_versions.joins(:feedbacks).count
          avg_score = app.app_versions.joins(:feedbacks).average(:overall_score) || 0

          app.as_json(include: { user: { only: [:id, :username] } }).merge({
            thumbnail_url: app.thumbnail_image.attached? ? url_for(app.thumbnail_image) : nil,
            version: latest_version&.version_number || '1.0.0',
            feedback_count: feedback_count,
            overall_score: avg_score.round(1)
          })
        end

        render json: apps_json
      end

      # GET /api/v1/apps/:id
      def show
        latest_version = @app.app_versions.order(release_date: :desc).first
        feedback_count = @app.app_versions.joins(:feedbacks).count
        avg_score = @app.app_versions.joins(:feedbacks).average(:overall_score) || 0

        data = @app.as_json(include: { 
          user: { only: [:id, :username] },
          app_versions: { 
            include: { 
              feedbacks: { 
                include: { user: { only: [:id, :username] } }
              }
            }
          }
        })
        
        data[:thumbnail_url] = @app.thumbnail_image.attached? ? url_for(@app.thumbnail_image) : nil
        data[:feedback_count] = feedback_count
        data[:overall_score] = avg_score.round(1)
        data[:is_owner] = user_signed_in? && current_user.id == @app.user_id

        render json: data
      end

      # POST /api/v1/apps
      def create
        @app = current_user.apps.new(app_params)
        if @app.save
          # 初回バージョンを作成
          @app.app_versions.create!(
            version_number: '1.0.0',
            release_date: Date.current,
            changelog: '初回リリース'
          )
          render json: @app, status: :created
        else
          render json: { errors: @app.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/apps/:id
      def update
        if @app.update(app_params)
          render json: @app
        else
          render json: { errors: @app.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/apps/:id
      def destroy
        @app.destroy
        head :no_content
      end

      def my_apps
        apps = current_user.apps.includes(:app_versions, thumbnail_image_attachment: :blob)
      
        apps_json = apps.map do |app|
          latest_version = app.app_versions.order(release_date: :desc).first
          feedback_count = app.app_versions.joins(:feedbacks).count
          avg_score = app.app_versions.joins(:feedbacks).average(:overall_score) || 0

          app.as_json.merge({
            thumbnail_url: app.thumbnail_image.attached? ? url_for(app.thumbnail_image) : nil,
            version: latest_version&.version_number || '1.0.0',
            feedback_count: feedback_count,
            overall_score: avg_score.round(1)
          })
        end
      
        render json: apps_json
      end

      private

      def set_app
        @app = App.find(params[:id])
      end

      def app_params
        params.require(:app).permit(
          :title,
          :description,
          :category,
          :github_url,
          :deploy_url,
          :thumbnail_image
        )
      end
    end
  end
end
