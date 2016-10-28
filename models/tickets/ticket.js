var mongoose = require("mongoose");
var Schema = mongoose.Schema;		

var TicketSchema = new Schema({	
	date: { type: Date },
    products: [{ product: {type: Schema.ObjectId, ref:"Product"}, iva: { type: Number }, total: {type: Number} } ],
    subtotal: { type: Number },
    total: { type: Number },
    clientId:  { type: Schema.ObjectId, ref:"User" }       
});

module.exports = mongoose.model("Ticket", TicketSchema);