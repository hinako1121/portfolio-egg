class CreateAppVersions < ActiveRecord::Migration[8.0]
  def change
    create_table :app_versions do |t|
      t.references :app, null: false, foreign_key: true
      t.string :version_number
      t.date :release_date
      t.text :changelog

      t.timestamps
    end
  end
end
