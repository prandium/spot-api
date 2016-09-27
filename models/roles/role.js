var mongoose = require("mongoose");
var Schema = mongoose.Schema;		

var RoleSchema = new Schema({	
	name: { type: String, unique: true, required: true },    
    canDelete: Boolean,
    canRead: Boolean,
    canEdit: Boolean,
    canCreate: Boolean,
    adminGroup: Boolean,
    employeeGroup: Boolean,
    default: Boolean,
    isActive: Boolean     
});

module.exports = mongoose.model("Role", RoleSchema);