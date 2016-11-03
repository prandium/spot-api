var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserQRSchema = new Schema({	
	decUser: { type: String, required: true },
    encUser: { type: String },
    isUpdated: { type: Boolean },
    createdAt: { type: Date },
    updatedAt: { type: Date }    
});

module.exports = mongoose.model("UserQR", UserQRSchema);
