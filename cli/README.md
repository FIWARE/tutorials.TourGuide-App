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

Allows the user to apply some configuration changes to some services.  This command has the following subcommands:

#### configure cygnus ####

Allows the user to configure the MySQL username and password for Cygnus.

#### configure hosts ####

Modify the hosts file to add entries for the running docker containers.

#### configure keyrock ####

Provision the TourGuide-App users, roles and permissions on Keyrock, then sync with Authzforce.

#### configure oauth ####

Get the OAuth credentials for TourGuide, as defined on Keyrock, and configure them on TourGuide-App container.

### load ###

Load sample data for TourGuide-App (restaurants, reservations and reviews).

#### load restaurants ####

Load sample restaurants for TourGuide-App.

#### load reservations ####

Create sample reservations for the restaurants available on TourGuide-App.

#### load reviews ####

Create sample reviews for the restaurants available on TourGuide-App.

### oauth-token ###

Get the OAuth token for a specific user.  This may be needed to make requests via curl.

### sensors ###

#### sensors create ####

#### sensors update ####

#### sensors send-data ####

#### sensors simulate-data ####

### start ###

Simple wrapper for docker-compose up.  Allows the user to start the TourGuide-App container and related services.

### stop ###

Simple wrapper for docker-compose stop/rm.  Allows the user to stop the TourGuide-App container and related services.
