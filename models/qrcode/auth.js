var mongoose = require("mongoose");
var Schema = mongoose.Schema;		

var AuthQRSchema = new Schema({	
	idAuth: { type: String, required: true },
    isUpdated: { type: Boolean },
    isSaved: { type: Boolean },
    createdBy: { type: Schema.ObjectId, ref: "User" },
    createdAt: { type: Date },
    updatedBy: { type: Schema.ObjectId, ref: "User" },
    updatedAt: { type: Date },
    savedBy: { type: Schema.ObjectId, ref: "User" },
    savedAt: { type: Date },
    rawData: { type: String }    
});
module.exports = mongoose.model("AuthQR", AuthQRSchema);
