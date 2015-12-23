server "40.114.41.180", :web, :app, :db, :primary => true, :no_release => false
set :deploy_root,    "/var/www/govwiki"
set :deploy_to,      "#{deploy_root}/#{deploy_dir}"
set :user,           "govwiki"
set :branch,         "azure-staging"
set :webserver_user, "www-data"