# == Schema Information
#
# Table name: feedbacks
#
#  id               :integer          not null, primary key
#  app_version_id   :integer          not null
#  user_id          :integer          not null
#  comment          :text
#  design_score     :integer
#  usability_score  :integer
#  creativity_score :integer
#  usefulness_score :integer
#  overall_score    :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_feedbacks_on_app_version_id  (app_version_id)
#  index_feedbacks_on_user_id         (user_id)
#

class Feedback < ApplicationRecord
  belongs_to :app_version
  belongs_to :user

  validates :design_score, :usability_score, :creativity_score, :usefulness_score, :overall_score,
            presence: true,
            inclusion: { in: 1..5 }
end
