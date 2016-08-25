module.exports = function (apiRoutes, uploadImage, upload) {	
	apiRoutes.post("/upload/image", upload.array('images'), uploadImage); 
};