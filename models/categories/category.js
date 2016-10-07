var mongoose = require("mongoose");
var	Schema = mongoose.Schema;

var CategorySchema = new Schema({
	name: { type: String, unique: true, required: true },
	icon: String,
	isActive: Boolean
});
module.exports = mongoose.model("Category", CategorySchema);