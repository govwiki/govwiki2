server "40.114.41.180", :web, :app, :db, :primary => true, :no_release => false
set :deploy_root,    "/var/www/govwiki"
set :deploy_to,      "#{deploy_root}/#{deploy_dir}"
set :user,           "govwiki"
set :branch,         "azure-staging"
set :webserver_user, "www-data"

after "deploy:create_symlink" do
    capifony_pretty_print "--> run #{update_cmd}"
    run "sh -c 'cd #{latest_release}; #{update_cmd}'"

    capifony_pretty_print "--> Creating symlimk for web folder"
    run "sh -c 'rm -rf #{deploy_root}/web && ln -s #{latest_release}/web #{deploy_root}/web'"
    capifony_puts_ok
end
