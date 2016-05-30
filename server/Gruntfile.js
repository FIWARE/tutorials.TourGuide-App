/*
 * Gruntfile.js
 * Copyright(c) 2016 Bitergia
 * Author: Bitergia <fiware-testing@bitergia.com>
 * MIT Licensed
 *
 * Gruntfile configuration
 *
 */

// jshint node: true, camelcase: false, maxlen: false
// jscs:disable requireCamelCaseOrUpperCaseIdentifiers, maximumLineLength

'use strict';

module.exports = function(grunt) {

  // configuration
  grunt.initConfig({

    // Run shell commands
    shell: {

      hooks: {
        // setup pre-commit git hook
        command: 'ln -sf ../../git-hooks/pre-commit ../.git/hooks/'
      },

      test_env_on: {
        // start clean containers for testing
        command: './setup-test-env.sh start'
      },

      test_env_off: {
        // stop testing containers
        command: './setup-test-env.sh stop'
      },

      test_env_logs: {
        // dump logs
        command: './setup-test-env.sh logs'
      },

      tests: {
        // execute jasmine_node tests inside testing container
        command: 'docker exec -u tourguide test_tourguide bash -c "cd ~/tutorials.TourGuide-App/server ; grunt do-test"'
      }

    },

    srcfiles: ['*.js', 'routes/*.js','feeders/*.js', 'idas/*.js', 'auth/*.js', 'misc/*.js', 'schema/*.js'],
    testfiles: ['spec/*.js'],

    jshint: {
      src: ['<%= srcfiles %>','<%= testfiles %>']
    },

    jscs: {
      src: ['<%= srcfiles %>','<%= testfiles %>']
    },

    jasmine_node: {
      options: {
        forceExit: true,
        match: '.',
        matchall: false,
        extensions: 'js',
        specNameMatcher: 'spec',
        specFolders: ['spec']
      },
      all: ['<%= srcfiles %>']
    }

  });

  // load tasks
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-continue');

  // define tasks
  grunt.registerTask('lint', 'Check source code style', ['jshint:src', 'jscs:src']);
  grunt.registerTask('do-test', 'Run jasmine tests', ['jasmine_node:all']);
  // Clean the .git/hooks/pre-commit file then copy in the latest version
  grunt.registerTask('setup-git-hooks', ['shell:hooks']);
  grunt.registerTask(
    'test',
    'Run tests on a clean docker-compose environment',
    [
      'shell:test_env_on',
      'continue:on',
      'shell:tests',
      'shell:test_env_logs',
      'continue:off',
      'shell:test_env_off',
      'continue:fail-on-warning'
    ]);

  // default task
  grunt.registerTask('default', ['lint', 'test']);
};
