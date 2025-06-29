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

class AppVersion < ApplicationRecord
  belongs_to :app
  has_many :feedbacks, dependent: :destroy

  validates :version_number, :release_date, presence: true
end

