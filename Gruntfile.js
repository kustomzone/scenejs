module.exports = function (grunt) {

    "use strict";

    var devScripts = grunt.file.readJSON("dev-scripts.json");

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        PROJECT_NAME: "<%= pkg.name %>",
        ENGINE_VERSION: "<%= pkg.version %>",
        build_dir: "build/<%= ENGINE_VERSION %>",
        plugin_dir: "src/plugins/",
        license: grunt.file.read("LICENSE.txt"),

        concat: {
            options: {
                banner: grunt.file.read('BANNER'),
                separator: ';',
                process: true
            },
            engine: {
                src: devScripts.engine,
                dest: 'api/latest/<%= PROJECT_NAME %>.js'
            }
        },

        uglify: {
            options: {
                report: "min",
                banner: grunt.file.read('BANNER')
            },
            engine: {
                files: {
                    "api/latest/<%= PROJECT_NAME %>.min.js": "<%= concat.engine.dest %>"
                }
            }
        },

        clean: {
            tmp: "tmp/*.js",
            docs: ["docs/*"]
        },

        copy: {
            minified: {
                src: 'api/latest/<%= PROJECT_NAME %>.min.js',
                dest: '<%= build_dir %>/<%= PROJECT_NAME %>-<%= ENGINE_VERSION %>.min.js'
            },
            unminified: {
                src: 'api/latest/<%= PROJECT_NAME %>.js',
                dest: '<%= build_dir %>/<%= PROJECT_NAME %>-<%= ENGINE_VERSION %>.js'
            },
            plugins: {
                expand: true,
                cwd: '<%= plugin_dir %>',
                src: '**',
                dest: 'api/latest/plugins/' 
            }
        },
        watch: {
            scripts: {
                files: ["<%= concat.engine.src %>", "<%= plugin_dir %>/**", "Gruntfile.js"],
                tasks: ["snapshot"],
                options: {
                  spawn: false,
                },
            },
        }
    });

    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Builds snapshot libs within api/latest
    // Run this when testing examples locally against your changes before committing them
    grunt.registerTask("snapshot", ["concat", "uglify", "copy:plugins"]);

    // Build a package within ./build
    // Assigns the package the current version number that's defined in package.json
    grunt.registerTask("build", ["snapshot", "copy-build"]);

    grunt.registerTask("copy-build", ["copy:minified", "copy:unminified"])

    grunt.registerTask("default", "snapshot");
};
