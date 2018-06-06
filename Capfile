# Custom config paths ( variables MUST be set before 'capistrano/setup' )
set :deploy_config_path,    'app/config/deploy.rb'
set :stage_config_path,     'app/config/stage'

# Load DSL and set up stages
require "capistrano/setup"
require "capistrano/deploy"
require 'capistrano/symfony'
require "capistrano/scm/rsync"

install_plugin Capistrano::SCM::Rsync

# Symfony 2+


# Load custom tasks from `lib/capistrano/tasks` if you have any defined

Dir.glob("lib/capistrano/tasks/*.rake").each { |r| import r }
