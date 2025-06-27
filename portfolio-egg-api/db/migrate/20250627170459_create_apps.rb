class CreateApps < ActiveRecord::Migration[8.0]
  def change
    create_table :apps do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title
      t.text :description
      t.string :thumbnail
      t.string :category
      t.string :github_url
      t.string :deploy_url

      t.timestamps
    end
  end
end
