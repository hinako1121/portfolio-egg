# frozen_string_literal: true

class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :omniauthable, omniauth_providers: [:github]
  include DeviseTokenAuth::Concerns::User
  validates :username, presence: true
  has_many :apps, dependent: :destroy
  has_many :feedbacks, dependent: :destroy
  has_one_attached :profile_image

end
