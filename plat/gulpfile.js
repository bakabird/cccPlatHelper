const gulp = require('gulp')
const rollup = require('rollup')
const ts = require('gulp-typescript');
const rename = require("gulp-rename");
const concat = require("gulp-concat");
const uglify = require('gulp-uglify-es').default;
const dts = require('dts-bundle')
const tsProject = ts.createProject('tsconfig.json', { declaration: true });

const onwarn = warning => {
    // Silence circular dependency warning for moment package
    if (warning.code === 'CIRCULAR_DEPENDENCY')
        return

    console.warn(`(!) ${warning.message}`)
}

gulp.task('buildJs', () => {
    return tsProject.src().pipe(tsProject()).pipe(gulp.dest('./build'));
})

gulp.task("rollup", async function () {
    let config = {
        input: "build/Plat.js",
        external: ['cc', 'cc/env'],
        output: {
            file: 'release/Plat.mjs',
            format: 'esm',
            extend: true,
            name: 'gnplat-cc',
        }
    };
    const subTask = await rollup.rollup(config);
    await subTask.write(config.output);
});

gulp.task("uglify", function () {
    return gulp.src("release/Plat.mjs")
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify(/* options */))
        .pipe(gulp.dest("release/"));
});

gulp.task('buildDts', function () {
    return new Promise(function (resolve, reject) {
        dts.bundle({
            name: "gnplat-cc",
            main: "./build/Plat.d.ts",
            out: "../build/Plat.d.ts.noglobal",
            prefix: '_____',
        });
        resolve();
    });
})

gulp.task("concatDTS", function () {
    return gulp.src(["src/plat.d.ts", "build/Plat.d.ts.noglobal"])
        .pipe(concat("Plat.d.ts"))
        .pipe(gulp.dest("release"))
})

gulp.task('default', gulp.series(
    'buildJs',
    'rollup',
    // 'uglify',
    'buildDts',
    'concatDTS',
))