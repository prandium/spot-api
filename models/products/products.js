var mongoose = require("mongoose");
var Schema = mongoose.Schema;		

var ProductSchema = new Schema({	
	name: { type: String, required: true },
    description: { type: String },
    ingredients: [{ type: String }],
    images: [{ type: { type: Schema.ObjectId, ref: "Image" } }],    
    price: { type: Number },
    tags: { type: String },
    isActive: { type: Boolean },    
    company: { type: Schema.ObjectId, ref:"Company" },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    createdBy: { type: Schema.ObjectId, ref:"User" },
    updatedBy: { type: Schema.ObjectId, ref:"User" }
});

module.exports = mongoose.model("Product", ProductSchema);