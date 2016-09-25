'use strict';
var gulp = require("gulp");
var tsc = require("gulp-typescript");

// configure typescript for use tsconfig.json
var tsProject = tsc.createProject("./tsconfig.json", { typescript: require("typescript") });


/**
 * Build all project in output directory
 */
gulp.task("build", function() {
    // compile typescript
    var tsResult = tsProject.src()
    .pipe(tsProject());
    // send javascript to output folder
    return tsResult.js.pipe(gulp.dest("./out"));
});

