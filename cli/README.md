# FIWARE TourGuide CLI and helper scripts #

This directory contains the helper scripts needed for the different commands and subcommands available through the `tour-guide` CLI script.  Each of these scripts defines the following functions:

* For commands:
    * module_help
    * module_options
    * module_cmd
* For subcommands
    * submodule_help
    * submodule_options
    * submodule_cmd

The main `tour-guide` script sources the command script requested and executes the `module_cmd` function.  For subcommands, the corresponding command script sources the subcommand script and executes the `submodule_cmd` function.

## Commands ##

Each command has its own parameters and help message.  Use `tour-guide <command> --help` to get help about a specific `<command>`.  If a command has subcommands, use `tour-guide <command> <subcommand> --help` to get help about that specific `<subcommand>`.

The following commands are available:

### check ###

Check if some required commands (both for running the containers and the scripts) are available.  The required commands are:

* docker
* docker-compose
* curl
* bc
* nc

### configure ###

#### configure cygnus ####

#### configure keyrock ####

#### configure oauth ####

### load ###

#### load restaurants ####

#### load reservations ####

#### load reviews ####

### oauth-token ###

### sensors ###

#### sensors create ####

#### sensors update ####

#### sensors send-data ####

#### sensors simulate-data ####

### start ###

Simple wrapper for docker-compose up.  Allows the user to start the TourGuide-App container and related services.

### stop ###

Simple wrapper for docker-compose stop/rm.  Allows the user to stop the TourGuide-App container and related services.
