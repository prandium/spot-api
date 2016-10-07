var mongoose = require("mongoose");
var	Schema = mongoose.Schema;

var MenuSchema = new Schema({
	name: { type: String, unique: true, required: true },
	icon: { type: String },
	selected: Boolean,
	position: { type: Number },
	isDefault: { type: Boolean },
	isActive: { type: Boolean },
	protectedLevel: { type: Number },
	path: { type: String }
});
module.exports = mongoose.model("Menu", MenuSchema);