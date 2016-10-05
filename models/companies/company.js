var mongoose = require("mongoose");
var Schema = mongoose.Schema;		

var CompanySchema = new Schema({	
	name: { type: String, required: true },
    description: { type: String },
    logo: { type: Schema.ObjectId, ref: "Image" },
    members: [{ 
        userId: { type: Schema.ObjectId, ref: "User" },
        roleId: { type: Schema.ObjectId, ref: "Role" }
    }],
    isActive: { type: Boolean },
    location: { type: String },
    address: { type: String },
    type: [{ type: Schema.ObjectId, ref: "Type" }],
    createdAt: { type: Date },
    updatedAt: { type: Date },
    createdBy: { type: Schema.ObjectId, ref:"User" },
    updatedBy: { type: Schema.ObjectId, ref:"User" }
});

module.exports = mongoose.model("Company", CompanySchema);