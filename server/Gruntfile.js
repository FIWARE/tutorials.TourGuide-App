// jshint node: true

'use strict';

module.exports = function(grunt) {

  // configuration
  grunt.initConfig({

    srcfiles: ['*.js', 'routes/*.js','feeders/*.js', 'idas/*.js'],

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

  // define tasks
  grunt.registerTask('lint', 'Check source code style', ['jshint', 'jscs']);

  // default task
  grunt.registerTask('default', ['lint']);
};
