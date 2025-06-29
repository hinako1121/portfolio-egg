# == Schema Information
#
# Table name: app_versions
#
#  id             :integer          not null, primary key
#  app_id         :integer          not null
#  version_number :string
#  release_date   :date
#  changelog      :text
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_app_versions_on_app_id  (app_id)
#

require "test_helper"

class AppVersionTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
