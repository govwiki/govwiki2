server '52.175.252.224',
user: 'sibers',
roles: %w{web app},
ssh_options: {
  forward_agent: false,
  auth_methods: %w(publickey)
}

set :rsync_options, {
  source: '.',
  cache: 'cached-copy',
  args: {
    local_to_remote: %W(--rsh #{fetch(:rsh)} --compress --recursive --delete --exclude=.git* --delete-excluded),
    cache_to_release: %w(--archive)
  }
}

set :deploy_to, '/var/www/html/govwiki_staging'
set :branch,    'azure-staging'

set :controllers_to_clear, [ 'app_dev.php', 'config.php' ]
set :deploy_via,           :rsync_with_remote_cache
