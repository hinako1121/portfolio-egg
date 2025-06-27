# == Schema Information
#
# Table name: apps
#
#  id          :integer          not null, primary key
#  user_id     :integer          not null
#  title       :string
#  description :text
#  thumbnail   :string
#  category    :string
#  github_url  :string
#  deploy_url  :string
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_apps_on_user_id  (user_id)
#

class App < ApplicationRecord
  belongs_to :user

  validates :title, :category, presence: true
  has_one_attached :thumbnail_image
end
