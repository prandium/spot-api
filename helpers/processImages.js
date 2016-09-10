module.exports = function processImg (filesrc) {
	var gulp = require('gulp');
	var smushit = require('gulp-smushit');
	//var Jimp = require("jimp");
	var thumbnailPath = "media/thumbnail/" + filesrc.split("\\")[filesrc.split("\\").length - 1];

	// Jimp.read(filesrc).then(function (lenna) {
	// 	lenna.resize(450, Jimp.AUTO)         
	// 		.write(thumbnailPath); // save
	// }).catch(function (err) {
	// 	console.error(err);
	// });

	gulp.src(filesrc)    
			.pipe(smushit())
			.pipe(gulp.dest('media/'));

  gulp.src(thumbnailPath)    
		.pipe(smushit())
		.pipe(gulp.dest('media/thumbnail/'));

    // .pipe(smushit())        
    // .pipe(gulp.dest("media/thumbnail/"));

  // save 300 x 200
  return;
  //.pipe(gulp.dest('../media/320'))
  // save 120 x 120
  // .pipe(imageResize({
  //   width: 120,
  //   height: 120,
  //   crop: true
  // }))
  // .pipe(gulp.dest('../media/120'))
  // // save 48 x 48
  // .pipe(imageResize({
  //   width: 48,
  //   height: 48,
  //   crop: true
  // }))
  // .pipe(gulp.dest('../media/48'));
};