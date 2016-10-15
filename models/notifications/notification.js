var mongoose = require("mongoose");
var Schema = mongoose.Schema;		

var NotificationSchema = new Schema({	
	title: { type: String },
    type: { type: Schema.ObjectId, ref:"NotificationType" },
    by: { type: Schema.ObjectId, ref:"User" },
    to: { type: Schema.ObjectId, ref:"User" },
    viewed: { type: Boolean },
    date: { type: Date },
    url: { type: String }
});

module.exports = mongoose.model("Notification", NotificationSchema);