/* global module:false */
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Task configuration.
    jshint: {
      all: ['./js/*.js','!./js/bootstrap/*.js'],
      options: {
        jshintrc: true
      }
    },

    gjslint: {
      options: {
        flags: [
          '--disable 220' // ignore error code 220 from gjslint
        ],
        reporter: {
          name: 'console'
        }
      },
      all: {
        src: '<%= jshint.all %>'
      }
    },

    fixjsstyle: {
      options: {
        flags: [
          '--disable 220' // ignore error code 220 from gjslint
        ],
        reporter: {
          name: 'console'
        }
      },
      all: {
        src: '<%= jshint.all %>'
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-gjslint');

  // register tasks.

  grunt.registerTask('linter', ['fixjsstyle', 'jshint:all', 'gjslint']);
};
