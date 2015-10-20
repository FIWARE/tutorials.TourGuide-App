// jshint node: true

'use strict';

module.exports = function(grunt) {

  // configuration
  grunt.initConfig({

    // Run shell commands
    shell: {
      hooks: {
        // Copy the project's pre-commit hook into .git/hooks
        command: 'ln -sf ../git-hooks/pre-commit ../.git/hooks/'
      }
    },

    srcfiles: ['spec/*.js', '*.js', 'routes/*.js','feeders/*.js', 'idas/*.js'],

    jshint: {
      src: '<%= srcfiles %>',
    },

    jscs: {
      src: '<%= srcfiles %>',
    }

  });

  // load tasks
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-shell');

  // define tasks
  grunt.registerTask('lint', 'Check source code style', ['jshint', 'jscs']);

  // Clean the .git/hooks/pre-commit file then copy in the latest version
  grunt.registerTask('setup-git-hooks', ['shell:hooks']);

  // default task
  grunt.registerTask('default', ['lint']);
};
