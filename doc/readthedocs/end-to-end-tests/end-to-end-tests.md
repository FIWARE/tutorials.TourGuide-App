## End to End tests

To run the end to end tests, you will need to first download the repository, then browse to `server` folder and run:

```
$ npm install
$ grunt
```

[Grunt](https://github.com/gruntjs/grunt) will run `jshint` and `jscs` linters as well as start a full TourGuide environment and run the End to End [jasmine-node](https://github.com/mhevery/jasmine-node) tests.
