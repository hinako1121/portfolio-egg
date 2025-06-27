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

require "test_helper"

class AppTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
