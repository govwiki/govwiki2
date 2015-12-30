server "govwiki-staging.cloudapp.net", :web, :app, :db, :primary => true, :no_release => false
set :deploy_root,    "/var/www/govwiki"
set :deploy_to,      "#{deploy_root}/#{deploy_dir}"
set :user,           "govwiki"
set :branch,         "azure-staging"
set :webserver_user, "www-data"

after "deploy:create_symlink" do
    capifony_pretty_print "--> run ./install.sh"
    run "sh -c 'cd #{latest_release}; ./install.sh'"
end
