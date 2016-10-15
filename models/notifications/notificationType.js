var mongoose = require("mongoose");
var Schema = mongoose.Schema;		

var NotificationTypeSchema = new Schema({	
	name: { type: String },
    icon: { type: String }
});

module.exports = mongoose.model("NotificationType", NotificationTypeSchema);