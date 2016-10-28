var mongoose = require("mongoose");
var Schema = mongoose.Schema;		

var RankingSchema = new Schema({		
    userId: { type: Schema.ObjectId, ref: "User" },
    companyId: { type: Schema.ObjectId, ref: "companyId" },
    ranking: { type: Number }        
});

module.exports = mongoose.model("Ranking", RankingSchema);