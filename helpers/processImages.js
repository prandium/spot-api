module.exports = function processImg (filesrc) {
	var gulp = require('gulp');
	var smushit = require('gulp-smushit');
  var imageName = filesrc.split("\\")[filesrc.split("\\").length - 1];
	var thumbnailPath = "media/thumbnail/" + imageName;
  var im = require("imagemagick");

  gulp.src(filesrc)    
  .pipe(smushit())
  .pipe(gulp.dest('media/'));
      
  var options = {
    width: 400,
    height: 400,
    srcPath: filesrc,
    dstPath: thumbnailPath
  };

  im.resize(options, function(err) {
    if(err) { throw err; }    
  });  

  return;
};