# Custom config paths ( variables MUST be set before 'capistrano/setup' )
set :deploy_config_path,    'app/config/deploy.rb'
set :stage_config_path,     'app/config/stage'

# Load DSL and set up stages
require "capistrano/setup"

# Include default deployment tasks
require "capistrano/deploy"
require "capistrano/scm/git"
install_plugin Capistrano::SCM::Git

# Symfony 2+
require 'capistrano/symfony'

# Load custom tasks from `lib/capistrano/tasks` if you have any defined
Dir.glob("lib/capistrano/tasks/*.rake").each { |r| import r }
