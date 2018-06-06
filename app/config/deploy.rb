set :stage, fetch(:stage)

set :application, 'Govwiki'

set :symfony_directory_structure, 2
set :sensio_distribution_version, 4
set :app_path,                    'app'
set :web_path,                    'web'
set :var_path,                    'app'
set :bin_path,                    'app'

set :app_config_path, -> { fetch(:app_path) + "/config" }
set :log_path, -> { fetch(:var_path) + "/logs" }
set :cache_path, -> { fetch(:var_path) + "/cache" }

set :symfony_console_path, -> { fetch(:bin_path) + "/console" }
set :symfony_console_flags, "--no-debug"

# GIT config
set :repo_url, 'git@git.sibers.com:sibers/govwiki.git'

set :linked_files, -> { [ "#{fetch :app_config_path}/parameters.yml" ] }
set :linked_dirs, -> { [ "#{fetch :var_path}" ] }

set :keep_releases, 3

set :permission_method, :acl
set :file_permissions_users, []
set :file_permissions_groups, []
set :file_permissions_paths, -> { [] }

# Composer
set :composer_install_flags, "--no-interaction --optimize-autoloader"

# Custom tasks
namespace :deploy do
    task :touch_params, roles => :app do
        on roles(:app) do
            linked_files(shared_path).each do |file|
                unless test "[ -f #{file} ]"
                    execute(:touch, "#{file}")
                end
            end
        end
    end
    task :rewrite_params, roles => :app do
        stage = fetch(:stage)
        config_path = fetch(:app_config_path)
        on roles(:app) do
            within "#{release_path}" do
                execute(:cp, "#{config_path}/parameters.yml.#{stage}","#{config_path}/parameters.yml")
            end
        end
    end
    task :assets, roles => :app do
        on roles(:app) do
            invoke "symfony:console", "assetic:dump", "--no-interaction"
        end
    end
    task :create_symlink_to_web, roles => :app do
        on roles(:app) do
            execute(:ln, "-sf", "#{current_path}/web", "#{deploy_to}/web")
        end
    end
end

before "deploy:check:linked_files", "deploy:touch_params"
before "composer:run",              "deploy:rewrite_params"
before "deploy:cleanup",            "deploy:create_symlink_to_web"
before "deploy:updated",            "deploy:set_permissions:acl"
before "symfony:cache:warmup",      "deploy:migrate"
before "symfony:cache:warmup",      "deploy:assets"
#after  "deploy:migrate",            "deploy:load_fixtures"

