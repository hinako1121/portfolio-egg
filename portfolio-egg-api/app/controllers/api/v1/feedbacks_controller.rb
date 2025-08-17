module Api
  module V1
    class FeedbacksController < ApplicationController
      before_action :authenticate_api_v1_user!, except: [:index]
      before_action :set_app_version

      def index
        feedbacks = @app_version.feedbacks.includes(:user).order(created_at: :desc)
        render json: feedbacks.as_json(include: { user: { only: [:id, :username] } }).map { |fb|
          if fb["user"]
            user = @app_version.feedbacks.find(fb["id"]).user
            fb["user"]["profile_image_url"] = user.profile_image.attached? ? url_for(user.profile_image) : nil
          end
          fb
        }
      end

      def create
        # 既存のフィードバックを確認
        existing_feedback = @app_version.feedbacks.find_by(user: current_api_v1_user)
        
        if existing_feedback
          # 既存のフィードバックを更新
          if existing_feedback.update(feedback_params)
            fb = existing_feedback.as_json(include: { user: { only: [:id, :username] } })
            user = existing_feedback.user
            fb["user"]["profile_image_url"] = user.profile_image.attached? ? url_for(user.profile_image) : nil
            render json: fb
          else
            render json: { errors: existing_feedback.errors.full_messages }, status: :unprocessable_entity
          end
        else
          # 新しいフィードバックを作成
          feedback = @app_version.feedbacks.new(feedback_params.merge(user: current_api_v1_user))
          if feedback.save
            fb = feedback.as_json(include: { user: { only: [:id, :username] } })
            user = feedback.user
            fb["user"]["profile_image_url"] = user.profile_image.attached? ? url_for(user.profile_image) : nil
            render json: fb, status: :created
          else
            render json: { errors: feedback.errors.full_messages }, status: :unprocessable_entity
          end
        end
      end

      # ユーザーの既存フィードバックを取得
      def my_feedback
        feedback = @app_version.feedbacks.find_by(user: current_api_v1_user)
        if feedback
          fb = feedback.as_json(include: { user: { only: [:id, :username] } })
          user = feedback.user
          fb["user"]["profile_image_url"] = user.profile_image.attached? ? url_for(user.profile_image) : nil
          render json: { feedback: fb }
        else
          render json: { feedback: nil }
        end
      end

      private

      def set_app_version
        @app_version = AppVersion.find(params[:app_version_id])
      end

      def feedback_params
        params.require(:feedback).permit(:comment, :design_score, :usability_score, :creativity_score, :usefulness_score, :overall_score)
      end
    end
  end
end
