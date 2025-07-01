module Api
  module V1
    class UsersController < ApplicationController
      before_action :authenticate_api_v1_user!

      def profile
        render json: {
          id: current_api_v1_user.id,
          username: current_api_v1_user.username,
          email: current_api_v1_user.email,
          bio: current_api_v1_user.bio,
          github_url: current_api_v1_user.github_url,
          twitter_url: current_api_v1_user.twitter_url,
          profile_image_url: current_api_v1_user.profile_image.attached? ? url_for(current_api_v1_user.profile_image) : nil
        }
      end

      def update_profile
        if current_api_v1_user.update(user_params)
          render json: {
            id: current_api_v1_user.id,
            username: current_api_v1_user.username,
            email: current_api_v1_user.email,
            bio: current_api_v1_user.bio,
            github_url: current_api_v1_user.github_url,
            twitter_url: current_api_v1_user.twitter_url,
            profile_image_url: current_api_v1_user.profile_image.attached? ? url_for(current_api_v1_user.profile_image) : nil
          }
        else
          render json: { errors: current_api_v1_user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def user_params
        params.require(:user).permit(:username, :bio, :github_url, :twitter_url, :profile_image)
      end
    end
  end
end 