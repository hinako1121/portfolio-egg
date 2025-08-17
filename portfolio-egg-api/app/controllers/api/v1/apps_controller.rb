module Api
  module V1
    class AppsController < ApplicationController
      before_action :authenticate_api_v1_user!, except: [:index, :show]
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
        else
          apps = apps.order(created_at: :desc)
        end

        apps_json = apps.map do |app|
          latest_version = app.app_versions.order(created_at: :desc).first
          feedback_count = app.app_versions.joins(:feedbacks).count
          avg_score = app.app_versions.joins(:feedbacks).average(:overall_score) || 0

          user_data = app.user.as_json(only: [:id, :username, :bio, :github_url, :twitter_url])
          user_data[:profile_image_url] = app.user.profile_image.attached? ? url_for(app.user.profile_image) : nil

          app.as_json(include: {}).merge({
            user: user_data,
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
        app = App.find(params[:id])
        app_versions = app.app_versions.order(release_date: :desc, id: :desc)

        user_data = app.user.as_json(only: [:id, :username, :bio, :github_url, :twitter_url])
        user_data[:profile_image_url] = app.user.profile_image.attached? ? url_for(app.user.profile_image) : nil

        is_owner = current_api_v1_user && app.user_id == current_api_v1_user.id

        # 各バージョン・各フィードバックのuserにprofile_image_urlを付与
        app_versions_json = app_versions.map do |version|
          version_json = version.as_json
          version_json["feedbacks"] = version.feedbacks.includes(:user).order(created_at: :desc).map do |fb|
            fb_json = fb.as_json
            fb_json["user"] = fb.user.as_json(only: [:id, :username])
            fb_json["user"]["profile_image_url"] = fb.user.profile_image.attached? ? url_for(fb.user.profile_image) : nil
            fb_json
          end
          version_json
        end

        render json: app.as_json.merge(
          user: user_data,
          thumbnail_url: app.thumbnail_image.attached? ? url_for(app.thumbnail_image) : nil,
          app_versions: app_versions_json,
          is_owner: is_owner
        )
      end

      # POST /api/v1/apps
      def create
        @app = current_api_v1_user.apps.new(app_params)
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
        apps = current_api_v1_user.apps.includes(:app_versions, thumbnail_image_attachment: :blob)
      
        apps_json = apps.map do |app|
          latest_version = app.app_versions.order(created_at: :desc).first
          feedback_count = app.app_versions.joins(:feedbacks).count
          avg_score = app.app_versions.joins(:feedbacks).average(:overall_score) || 0

          user_data = app.user.as_json(only: [:id, :username, :bio, :github_url, :twitter_url])
          user_data[:profile_image_url] = app.user.profile_image.attached? ? url_for(app.user.profile_image) : nil

          app.as_json.merge({
            user: user_data,
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
