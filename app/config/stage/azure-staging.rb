server "52.175.252.224", :web, :app, :db, :primary => true, :no_release => false
set :deploy_root,    "/var/www/html/govwiki_staging"
set :deploy_to,      "#{deploy_root}/#{deploy_dir}"
set :user,           "sibers"
set :branch,         "azure-staging"
set :webserver_user, "www-data"
set :deploy_via,     :rsync_with_remote_cache

after "deploy:create_symlink" do
    capifony_pretty_print "--> run ./install.sh"
    run "sh -c 'cd #{latest_release}; /bin/bash ./install.sh'"
end
