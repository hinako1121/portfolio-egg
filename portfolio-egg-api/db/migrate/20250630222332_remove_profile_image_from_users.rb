class RemoveProfileImageFromUsers < ActiveRecord::Migration[8.0]
  def change
    remove_column :users, :profile_image, :string
  end
end
