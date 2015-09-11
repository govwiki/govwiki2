server "45.55.0.145", :web, :app, :db, :primary => true, :no_release => false
set :deploy_root, "/var/www/html/govwiki"
set :deploy_to,   "#{deploy_root}/#{deploy_dir}"
set :user,        "govwiki"
