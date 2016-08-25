var mongoose = require("mongoose"),
	Schema = mongoose.Schema;		
	
var ImageSchema = new Schema({	
	name: { type: String, required: true },
	type: { type: String, required: true },
	path: { type: String, required: true },
	thumbnail: { 
		Name: String,
		Type: String,
		Path: String
	},
	createdAt: Date,
	updatedAt: Date,				
	createdBy: String, //user._id,
	updatedBy: String,
	isActive: Boolean
});

module.exports = mongoose.model("Image", ImageSchema);