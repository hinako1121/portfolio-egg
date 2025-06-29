module Api
  module V1
    class UsersController < ApplicationController
      before_action :authenticate_user!

      def profile
        render json: {
          id: current_user.id,
          username: current_user.username,
          email: current_user.email,
          bio: current_user.bio,
          github_url: current_user.github_url,
          profile_image_url: current_user.profile_image.attached? ? url_for(current_user.profile_image) : nil
        }
      end

      def update_profile
        if current_user.update(user_params)
          render json: {
            id: current_user.id,
            username: current_user.username,
            email: current_user.email,
            bio: current_user.bio,
            github_url: current_user.github_url,
            profile_image_url: current_user.profile_image.attached? ? url_for(current_user.profile_image) : nil
          }
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def user_params
        params.require(:user).permit(:username, :bio, :github_url, :profile_image)
      end
    end
  end
end 