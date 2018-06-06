set :deploy_config_path,    'app/config/deploy.rb'
set :stage_config_path,     'app/config/stage'

require "capistrano/setup"
require "capistrano/deploy"
require 'capistrano/symfony'
require "capistrano/scm/rsync"

install_plugin Capistrano::SCM::Rsync

Dir.glob("lib/capistrano/tasks/*.rake").each { |r| import r }
