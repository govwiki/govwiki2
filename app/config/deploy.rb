# Stages
set :stages,        %w(demo droplet azure-staging azure-prod)
set :default_stage, "demo"
set :stage_dir,     "app/config/stage"
set :keep_releases, 3
set :ssh_options, { :forward_agent => false }

# Capifony settings
require "capistrano/ext/multistage"
require "fileutils"
require "zlib"

# Application
set :application,         "GovWiki"
default_run_options[:pty] = true
set :app_path,            "app"
set :model_manager,       "doctrine"
set :deploy_dir,          "deploy"

# Version control
# pass branch as parameter: example: cap development deploy -S branch=origin/development
set :scm,               :git
set :repository,        "git@git.sibers.com:sibers/govwiki.git"
set :git_shallow_clone, 1
set :branch,            fetch(:branch, '').sub!(/^.*\//, "") # remove origin/ prefix from branch

# Directories
set :writable_dirs,         [app_path + "/cache", app_path + "/logs", web_path + "/documents"]
set :shared_files,          ["app/config/parameters.yml"]
set :shared_children,       [app_path + "/logs", web_path + "/img/upload", web_path + "/css", web_path + "/documents"]
set :remote_backup_dir,     "/tmp"

# Permissions
set :permission_method,     :acl
set :use_set_permissions,   true
set :use_sudo,              false
set :webserver_user,        "apache"
ssh_options[:forward_agent] = true

# Symfony
set :use_composer,          true
set :copy_vendors,          true
set :dump_assetic_assets,   true
set :interactive_mode,      false
set :update_cmd,            "./update.sh"

# Custom tasks
namespace :govwiki do

# Upload parameters file
  namespace :setup do
      desc "Uploads parameters.yml.dist file"
      task :upload_parameters do
          origin_file = "app/config/parameters.yml.dist"
          destination_file = shared_path + "/app/config/parameters.yml"
          try_sudo "mkdir -p #{File.dirname(destination_file)}"
          top.upload(origin_file, destination_file)
      end
  end

# Backup
  namespace :backup do
    desc "backup database and shared data"
    task :remote do
      capifony_pretty_print "--> Backup #{shared_path}"
      config = ""
      data   = capture("#{try_sudo} cat #{shared_path}/#{app_config_path}/#{app_config_file}")
      config = load_database_config data, symfony_env_prod

      installation_backup_dir        = "#{Time.now.utc.strftime("%Y_%m_%d")}/#{config['installation']}/#{Time.now.utc.strftime("%H_%M_%S")}"
      remote_installation_backup_dir = "#{remote_backup_dir}/#{installation_backup_dir}"

      sql_filename                   = "#{config['database_name']}.sql.gz"
      sql_file                       = "#{remote_installation_backup_dir}/#{sql_filename}"

      shared_filename                = "#{application}.tar.gz"
      shared_file                    = "#{remote_installation_backup_dir}/#{shared_filename}"

      #creating backup folders
      capifony_pretty_print "--> Creating backup folders: #{remote_installation_backup_dir}"
      run("mkdir -p #{remote_installation_backup_dir}")
      capifony_puts_ok

      #backup sql
      capifony_pretty_print "--> Backuping db: #{config['database_name']}"
      data = capture("#{try_sudo} sh -c 'mysqldump -u#{config['database_user']} --host='#{config['database_host']}' --password='#{config['database_password']}' #{config['database_name']} --force | gzip -c > #{sql_file}'")
      puts data
      capifony_puts_ok

      #backup shared
      capifony_pretty_print "--> Backuping #{shared_path}"

      exclude_dirs = '';
      ["vendor", "./app/cache", "./app/logs"].each{|folder| exclude_dirs += " --exclude=#{folder}" }

      run "#{try_sudo} sh -c 'cd #{shared_path}; tar -zcvf #{shared_file} . #{exclude_dirs}'"

      capifony_puts_ok
    end
  end

  namespace :update_code do
    desc "Rewrite parameters"
    task :rewrite_params do
      capifony_pretty_print "--> Rewriting parameters.yml with app/config/parameters.yml.#{stage}"
      run "sh -c 'cd #{latest_release} && cp app/config/parameters.yml.#{stage} app/config/parameters.yml'"
      capifony_puts_ok
    end
  end
end

# Dependencies
after  "deploy:setup",       "govwiki:setup:upload_parameters"
before "deploy:update_code", "govwiki:backup:remote"
before "symfony:composer:install", "govwiki:update_code:rewrite_params"
#after  "deploy:update_code", "govwiki:update_code:rewrite_params"
after  "deploy",             "deploy:cleanup"
before "symfony:cache:warmup", "symfony:doctrine:migrations:migrate"

# Logging
logger.level = Logger::MAX_LEVEL
