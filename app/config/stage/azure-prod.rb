server "govwiki.cloudapp.net", :web, :app, :db, :primary => true, :no_release => false
set :deploy_root,    "/var/www/html/govwiki"
set :deploy_to,      "#{deploy_root}/#{deploy_dir}"
set :user,           "joffemd"
set :branch,         "azure-prod"
set :webserver_user, "www-data"

after "deploy:create_symlink" do
    capifony_pretty_print "--> run ./install.sh"
    run "sh -c 'cd #{latest_release}; /bin/bash ./install.sh'"
end
