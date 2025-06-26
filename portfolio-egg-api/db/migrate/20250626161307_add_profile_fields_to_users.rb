class AddProfileFieldsToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :username, :string, :null => false, default: "user"
    add_column :users, :profile_image, :string
    add_column :users, :bio, :text
    add_column :users, :github_url, :string
    add_column :users, :twitter_url, :string
  end
end
