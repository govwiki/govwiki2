server '52.175.252.224',
user: 'sibers',
roles: %w{web app},
ssh_options: {
  forward_agent: false,
  auth_methods: %w(publickey)
}

set :deploy_to,      '/var/www/html/govwiki_staging'
set :branch,         'azure-staging'

set :symfony_env, 'prod'
set :controllers_to_clear, [ 'app_dev.php', 'config.php' ]

#set :deploy_via,     :rsync_with_remote_cache

after "deploy:create_symlink" do
    capifony_pretty_print "--> run ./install.sh"
    run "sh -c 'cd #{latest_release}; /bin/bash ./install.sh'"
end
