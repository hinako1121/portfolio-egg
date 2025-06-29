class CreateFeedbacks < ActiveRecord::Migration[8.0]
  def change
    create_table :feedbacks do |t|
      t.references :app_version, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.text :comment
      t.integer :design_score
      t.integer :usability_score
      t.integer :creativity_score
      t.integer :usefulness_score
      t.integer :overall_score

      t.timestamps
    end
  end
end
