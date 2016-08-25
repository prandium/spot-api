var mongoose = require("mongoose");
var Schema = mongoose.Schema;		

var RoleSchema = new Schema({	
	name: { type: String, unique: true, required: true },
    canDelete: Boolean,
    canRead: Boolean,
    canEdit: Boolean,
    canCreate: Boolean,
    default: { type: Boolean, unique: true }
});

module.exports = mongoose.model("Role", RoleSchema);