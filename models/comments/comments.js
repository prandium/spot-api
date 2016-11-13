var mongoose = require("mongoose");
var Schema = mongoose.Schema;		

var CommentsSchema = new Schema({
    to: { type: Schema.ObjectId, ref: "Company" }, 		
    body: { type: String },
    createdBy: { type: Schema.ObjectId, ref: "User" },
    updatedBy: { type: Schema.ObjectId, ref: "User" },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    isActive: { type: Boolean }
});

module.exports = mongoose.model("Comments", CommentsSchema);