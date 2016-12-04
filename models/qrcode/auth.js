var mongoose = require("mongoose");
var Schema = mongoose.Schema;		

var ByQRSchema = new Schema({	
	qrcode: { type: String, required: true },
    isBlank: { type: Boolean },
    isPaid: { type: Boolean },
    trade: { type: Schema.ObjectId, ref: "User" },
    amount: { type: String },
    intent: { type: String },
    updatedAt: { type: Date },
    confirmT: { type: String },
    type: { type: String }    
});
module.exports = mongoose.model("findByQR", ByQRSchema);
