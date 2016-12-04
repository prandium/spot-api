module.exports = function (apiRoutes) {

	var findByQR = require("../../models/qrcode/auth"),
		ERRORS = require("../../constants/errors"),
		User = require("../../models/auth/user"),
		jwt = require("jwt-simple"),
		config = require("../../config/database"),
        qr = require('qr-image'),
		nuuid = require('node-uuid');
	
	function genQR(){
		var hashID = new Buffer(nuuid.v4()).toString('base64');
		var qrsvg = qr.image(hashID, { type: 'svg' });
		qrsvg.pipe(require('fs').createWriteStream('media/qrcode/'/* + path*/ + hashID + '.svg'));
		return hashID;
	}
	
	apiRoutes.post("/qr/trade", tradeadm);
	function tradeadm(request, response) {
		var token = request.body.token || request.query.token || request.headers["authorization"],
			_user;
        
        if (token) { _user = jwt.decode(token, config.secret); }
        else return response.status(403).send({ success: false, msg: ERRORS.NO_TOKEN.Text });
		var rbody = request.body;
		if(!rbody.operation) { return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code }); }
		else {
			if(rbody.operation == 'create'){
				if (!(/^tr_code$|^tb_code$|^sd_code$/.test(rbody.type))) return response.status(200).send({ success: false, code: 51 });
				else if (rbody.type == "sd_code") {findByQR.find({trade: _user._id,type: rbody.type}, function (ern,cnt){if (ern) return;else response.status(200).send({ success: false, qrcode: cnt[0].qrcode, code: 52 });});}
				else if ((!rbody.amount || rbody.amount <= 0) && rbody.type == "tr_code") return response.status(200).send({ success: false, code: 53 });
				else if (/^tr_code$|^tb_code$|^sd_code$/.test(rbody.type)){
					var hshQR = genQR();
					var aamount = (/^sd_code$|^tb_code$/.test(rbody.type)) ? [0,true]:[rbody.amount,false];
					var confirmTC = (rbody.type == "sd_code")?Math.floor(Math.random()*9000) + 1000:null;
					var newfindByQR = new findByQR({
						qrcode: hshQR,
						amount: aamount[0],
						trade: _user._id,
						isBlank: aamount[1],
						isPaid: false,
						confirmT: confirmTC,
						type: rbody.type,
						updatedAt: null,
						intent: null
					});
					newfindByQR.save(function(err) {
						if (err) { return response.status(500).send({success: false, msg: err}); }
						else { return response.status(201).send({success: true, qrcode: hshQR, code: 50}); };
					});
				}
				else return response.status(500).send({success: false, msg: err});
			}
			else if(rbody.operation == 'update'){
				if (!rbody.qrcode) return response.status(200).send({ success: false, code: 54 });
				findByQR.findOne({ qrcode: rbody.qrcode }, function (err, sdbqr){
					if (!err && sdbqr ) {
						if (sdbqr.trade == _user._id){
						    //F4				
							var renew = (rbody.renew == true) ? [true,genQR()]:[false,sdbqr.qrcode];
							if ((!rbody.amount || rbody.amount <= 0) && !renew && sdbqr.type == "tb_code") return response.status(200).send({ success: false, code: 53});
							else if (!renew[0] && sdbqr.type == "sd_code") return response.status(200).send({ success: false, qrcode: renew[1], code: 58 });
							else if (/^sd_code$|^tb_code$/.test(sdbqr.type) ){
								if ((!rbody.amount || rbody.amount <= 0) && sdbqr.type == "tb_code") sdbqr.amount = rbody.amount;
								sdbqr.qrcode= renew[1];
								sdbqr.updatedAt= new Date().getUTCDate();
								sdbqr.save(function(err) {
									if (!err) return response.status(200).send({success: true, qrcode: renew[1], code: 55 });
									else return response.status(500).send({success: false, msg: err});
								});
							}
							else if (sdbqr.type=="tr_code") return response.status(200).send({success: false, code: 56 });
							else return response.status(200).send({success: false, code: 51 });
						}
						else return response.status(403).send({ success: false, code: 57 });
					}
					else if (!sdbqr) return response.status(404).send({ success: false, code: 60 });
					else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
				});
			}
			//F5
			else if(rbody.operation == 'status'){
				if (!rbody.qrcode) return response.status(200).send({ success: false, code: 54 });
				findByQR.findOne({ qrcode: rbody.qrcode }, function (err, sdbqr){
					if (!err && sdbqr) {
						var validated = typeof rbody.confirm==="undefined"||rbody.confirm==false?false:true
						if (sdbqr.type == "sd_code") return response.status(200).send({ success: false, code: 73 });
						else if (sdbqr.isPaid && sdbqr.type == "tr_code") return response.status(200).send({ success: false, code: 71 });
						else if (validated && sdbqr.isPaid){ //F6
							sdbqr.amount= 0;
							sdbqr.isPaid= false;
							sdbqr.isBlank= true;
							sdbqr.intent= 0;
							sdbqr.save(function(err) {
								if (!err) return response.status(200).send({success: true, paid: true, confirm: sdbqr.confirmT, code: 70 });
								else return response.status(500).send({success: false, msg: err});
							});
						}
						else if ((/^tr_code$|^tb_code$/.test(sdbqr.type)) && sdbqr.isPaid == false) return response.status(200).send({ success: false, code: 72 });
						else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
					}
					else if (!err && !sdbqr) return response.status(200).send({ success: false, code: 60 });
					else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
				});
			}

			else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
			};
		};

	apiRoutes.post("/qr/payment", qrpaym);
	function qrpaym(request,response) {
		var token = request.body.token || request.query.token || request.headers["authorization"],
			_user;
        if (token) { _user = jwt.decode(token, config.secret); }
        else return response.status(403).send({ success: false, msg: ERRORS.NO_TOKEN.Text });
		var rbody = request.body;
		if(!rbody.qrcode || !rbody.operation) { return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code }); }	
		else {
			if (rbody.operation == "find"){
		        findByQR.findOne({ qrcode: rbody.qrcode }, function (err, sdbqr){
		            if (!err && sdbqr) {
						if (sdbqr.type == "sd_code") return response.status(200).send({ success: false, trade: sdbqr.trade, type: sdbqr.type, confirm: sdbqr.confirmT, code: 74 })
						else if (sdbqr.isBlank == true && sdbqr.type == "tb_code") return response.status(200).send({ success: false, code: 77 })
						else if (/^tr_code$|^tb_code$/.test(sdbqr.type) && sdbqr.isPaid == true) return response.status(200).send({ success: false, code: 76 })
						else {
							var tempCode = Math.floor(Math.random()*9000) + 1000;
							sdbqr.confirmT = tempCode;
							sdbqr.save(function (err) {
								if(!err) return response.status(200).send({ success: true, amount: sdbqr.amount, trade: sdbqr.trade, type: sdbqr.type, confirm: tempCode, code: 75 });
								else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
							});
						}
					}
		            else if (!err && !sdbqr) return response.status(200).send({ success: false, code: 60 });
		            else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
		        });
		    }

			else if(rbody.operation == "payment"){
				if (typeof rbody.qrcode === "undefined" || typeof rbody.confirm === "undefined" ) return response.status(200).send({ success: false, code: 59 });
				findByQR.findOne({ qrcode: rbody.qrcode }, function (err, sdbqr){
		            if (!err && sdbqr) {
						if (rbody.confirm != sdbqr.confirmT) return response.status(200).send({ success: false, code: 78 })
						else if ((typeof rbody.amount === "undefined" || rbody.amount <= 0) && /^sd_code$|^tb_code$/.test(sdbqr.type)) return response.status(200).send({ success: false, code: 79 })
						else if (rbody.amount != sdbqr.amount && sdbqr.type == "tr_code") return response.status(200).send({ success: false, code: 82 })
						else if (/^tr_code$|^tb_code$/.test(sdbqr.type) && sdbqr.isPaid == true) return response.status(200).send({ success: false, code: 83 })
						else{
							var notes = typeof rbody.notes==="undefined"?"N/A":rbody.notes.replace(/[^a-zA-Z0-9 .]/g,'_');
							var aIsBlank = /^sd_code$|^tb_code$/.test(sdbqr.type)?true:false;
							var aIsPaid = sdbqr.type == "sd_code"?false:true;
							//var mkPayment = paymentCC(sdbqr.amount,sdbqr.trade,notes);
							//var testAuth = new Date().getTime().toString().slice(-6);
							var mkPayment = [1,153454321]
							if (mkPayment[0] === 1){
								sdbqr.isPaid = aIsPaid;
								sdbqr.isBlank = aIsBlank;
								sdbqr.intent = 0;
								sdbqr.save(function (err) {
									if(!err) return response.status(200).send({ success: true, authorization: mkPayment[1], confirm: sdbqr.confirmT, code: 80 });
									else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
								});
							}
							else if(mkPayment[0] === 2){
								sdbqr.intent += 1;
								sdbqr.save(function (err) {
									if(!err) return response.status(200).send({ success: false, code: 81});
									else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
								});
							}
							else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
						}
					}
					else if (!err && !sdbqr) return response.status(200).send({ success: false, code: 60 });
		            else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
				});
			}
			else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
		};
	};
}
