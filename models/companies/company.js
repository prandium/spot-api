var mongoose = require("mongoose");
var Schema = mongoose.Schema;		

var CompanySchema = new Schema({	
	name: { type: String, required: true },
    description: { type: String },
    logo: { type: Schema.ObjectId, ref: "Image" },
    cover: { type: Schema.ObjectId, ref: "Image" },
    members: [{ 
        userId: { type: Schema.ObjectId, ref: "User" },
        roleId: { type: Schema.ObjectId, ref: "Role" }
    }],
    isActive: { type: Boolean },    
    location: { 'type': {type: String, enum: "Point", default: "Point"}, coordinates: { type: [Number], default: [0,0]} },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    categories: [{ type: Schema.ObjectId, ref: "Category" }],
    createdAt: { type: Date },
    updatedAt: { type: Date },
    createdBy: { type: Schema.ObjectId, ref:"User" },
    updatedBy: { type: Schema.ObjectId, ref:"User" },
    ranking: { type: Number },    
    privateKey: { type: String },
    publicKey: { type: String },
    allowCreditCard: { type: Boolean },
    plan: { type: String }    
}).index({"location.coordinates": "2dsphere"});

module.exports = mongoose.model("Company", CompanySchema);