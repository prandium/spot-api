var mongoose = require("mongoose");
var	Schema = mongoose.Schema;

var TypeSchema = new Schema({
	name: { type: String, unique: true, required: true },
	image: { type: Schema.ObjectId, ref: "Image" },
	categories: [{ type: Schema.ObjectId, ref: "Category" }],
	position: { type: Number },
	isActive: { type: Boolean }
});
module.exports = mongoose.model("Type", TypeSchema);