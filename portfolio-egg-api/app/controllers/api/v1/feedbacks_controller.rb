module Api
  module V1
    class FeedbacksController < ApplicationController
      before_action :authenticate_user!, except: [:index]
      before_action :set_app_version

      def index
        feedbacks = @app_version.feedbacks.includes(:user).order(created_at: :desc)
        render json: feedbacks.as_json(include: { user: { only: [:id, :username] } })
      end

      def create
        feedback = @app_version.feedbacks.new(feedback_params.merge(user: current_user))
        if feedback.save
          render json: feedback.as_json(include: { user: { only: [:id, :username] } }), status: :created
        else
          render json: { errors: feedback.errors.full_messages }, status: :unprocessable_entity
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
