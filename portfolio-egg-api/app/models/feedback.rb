class Feedback < ApplicationRecord
  belongs_to :app_version
  belongs_to :user

  validates :design_score, :usability_score, :creativity_score, :usefulness_score, :overall_score,
            presence: true,
            inclusion: { in: 1..5 }
end
