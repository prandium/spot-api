module.exports = function (apiRoutes) {

var crypto = require ("crypto"),
	multer = require("multer"),
	upload = multer({ storage : multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, "media/")
		},
		filename: function (req, file, cb) {			
			crypto.pseudoRandomBytes(16, function (err, raw) {
			cb(null, raw.toString("hex") + '.' + file.originalname.split(".")[file.originalname.split(".").length - 1]);
			});
		}
	})}),
	jwt = require("jwt-simple"),
	config = require("../../config/database"),
	Image = require("../../models/uploads/image");	
	
	apiRoutes.post("/upload/image", upload.array('images'), uploadImage);
	function uploadImage(request, response) {
		var user = null,
            token = null,
            newImages = [],
			imagesIDs = [],
			invalidFiles = [],
			mimeTypes = ["image/jpeg", "image/png"];
        
        token = request.body.token || request.query.token || request.headers["authorization"];        
        
        if (token) user = jwt.decode(token, config.secret)                        
        else return response.status(403).send({ success: false, message: 'No token provided.' });				

		for (var i = 0; i < request.files.length; i++) {						

			require("../../helpers/processImages")(request.files[i].path);

			var image = {
				name: request.files[i].filename,
				type: request.files[i].mimetype,
				path: request.files[i].path,
				thumbnail: { 
					Name: request.files[i].filename,
					Type: request.files[i].mimetype,
					Path: request.files[i].path,
				},
				createdAt: new Date(),
				updatedAt: null,				
				createdBy: user._id,
				updatedBy: null,				
				isActive: false
			};

			if (mimeTypes.indexOf(request.files[i].mimetype) >= 0) newImages.push(image);
			else invalidFiles.push(image);			
		};

		Image.create(newImages, function (err, data) {
			for (var i=0; i < data.length; i++) {
				imagesIDs.push(data[i].id);
			};

			if (err) return response.status(500).send({success: false, msg: err});
			else return response.status(201).send({success: true, msg: "Success.", invalidFiles: invalidFiles, validFiles: imagesIDs })
		});					
	};			
};