

module.exports = function (apiRoutes) {

	var AuthQR = require("../../models/qrcode/auth"),
		UserQR = require("../../models/qrcode/user"),
		ERRORS = require("../../constants/errors"),
		User = require("../../models/auth/user"),
		jwt = require("jwt-simple"),
		config = require("../../config/database"),
        qr = require('qr-image'),
		nuuid = require('node-uuid');
		
	apiRoutes.post("/qrcode/gen", QRGen);
	function QRGen(request, response) {
		var token = request.body.token || request.query.token || request.headers["authorization"],
			_user;
        
        if (token) { _user = jwt.decode(token, config.secret); }
        else return response.status(403).send({ success: false, msg: ERRORS.NO_TOKEN.Text });

		if(!request.body.operation) { return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code }); }	
		else {
			function genQR(){
				var hashID = new Buffer(nuuid.v4()).toString('base64');
				var qrsvg = qr.image(hashID, { type: 'svg' });
				qrsvg.pipe(require('fs').createWriteStream('media/qrcode/'/* + path*/ + hashID + '.svg'));
				return hashID;
			}


			if( request.body.operation == 'create'){
				var hshQR = genQR();
				var newAuthQR = new AuthQR({
					idAuth: hshQR,
					isUpdated: false,
					isSaved: false,
					createdBy: _user._id,
					createdAt: new Date().getUTCDate(),
					updatedBy: null,
					updatedAt: null,
					savedBy: null,
					savedAt: null,
					rawData: request.body.data
				});
				
				newAuthQR.save(function(err) {
					if (err) { return response.status(500).send({success: false, msg: err}); }
					else { return response.status(201).send({success: true, status: "created", qrcode: hshQR}); };
				});
			}
						
			else if (request.body.operation == "createUID"){
			    UserQR.findOne({ decUser: _user._id }, function (err, sdbqr){
			        if (!err && sdbqr && request.body.update == true ){
						var hshQR = genQR();
			            sdbqr.encUser= hshQR;
			            sdbqr.isUpdated= true;
			            sdbqr.updatedAt= new Date().getUTCDate();
			            /*sdbqr.updatedBy= _user._id;*/
			            sdbqr.save(function(err) {
			                if (err) { return response.status(500).send({success: false, msg: err}); }
			                else { return response.status(201).send({ success: true, status: "updated", qrcode: hshQR });};
			            });
			        }
			        else if (!err && sdbqr ){
			            return response.status(200).send({ success: true, status: "already.exist", qrcode: sdbqr.encUser });
			        }
			        else if (!err && !sdbqr){
						var hshQR = genQR();
						var newUserQR = new UserQR({
			                encUser: hshQR,
			                isUpdated: false,
			                decUser: _user._id,
			                createdAt: new Date().getUTCDate(),
			                updatedAt: null
			              
			            });
			            newUserQR.save(function(err) {
			                if (err) { return response.status(500).send({success: false, msg: err}); }
			                else { return response.status(201).send({success: true, status: "created", qrcode: hshQR}); };
			            });
			        }
			        else {
			            return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
			        }
			    });
			}

			else if( request.body.operation == 'update'){
				AuthQR.findOne({ idAuth: request.body.qrcode }, function (err, sdbqr){
					if (!err && sdbqr) {
						if (sdbqr.isSaved== true) return response.status(200).send({ success: true, status: "already.saved"});
						else{
							var hshQR = genQR();
							sdbqr.idAuth= hshQR;
							sdbqr.isUpdated= true;
							sdbqr.isSaved= false;
							sdbqr.updatedBy= _user._id;
							sdbqr.updatedAt= new Date().getUTCDate();
							if (request.body.data){sdbqr.rawData= request.body.data;}
							sdbqr.save(function(err) {
								if (err) { return response.status(500).send({success: false, msg: err}); }
								else { return response.status(201).send({success: true, status: "updated", qrcode: hshQR}); };
							});
						}}
						else if (!sdbqr) return response.status(404).send({ success: false, status: "not.found", msg: "QR Code not found", code: 20 });
						else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
					});
				}
				else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
			};
		};

	apiRoutes.post("/qrcode/get", confirm);
	function confirm(request,response) {
		var token = request.body.token || request.query.token || request.headers["authorization"],
			_user;
        if (token) { _user = jwt.decode(token, config.secret); }
        else return response.status(403).send({ success: false, msg: ERRORS.NO_TOKEN.Text });

		if(!request.body.qrcode && !request.body.type) { return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code }); }	
		else {
		    
		    if (request.body.type == "profile"){
		        UserQR.findOne({ encUser: request.body.qrcode }, function (err, sdbqr){
		            if(!err && sdbqr) return response.status(200).send({ success: true, status: "active", UserID: sdbqr.decUser});
		            else if (!sdbqr) return response.status(404).send({ success: false, status: "not.found", msg: "QR Code not found", code: 20 });
		            else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
		        });
		    }
		    else{
		        AuthQR.findOne({ idAuth: request.body.qrcode }, function (err, sdbqr){
		            if (!err && sdbqr) {
		                if (!sdbqr.isSaved){
		                    sdbqr.isSaved= true;
		                    sdbqr.savedBy= _user._id;
		                    sdbqr.savedAt= new Date().getUTCDate();
		                    sdbqr.save(function (err) {
		                        if(!err) return response.status(200).send({ success: true, status: "saved", data: sdbqr.rawData, company: sdbqr.createdBy, date: sdbqr.createdAt });
		                        else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
		                    });}
		                    else if (sdbqr.savedBy == _user._id) return response.status(200).send({ success: true, status: "already.saved", savedBy: _user._id });
		                    else return response.status(200).send({ success: true, status: "already.saved"});
		            }
		            else if (!sdbqr) return response.status(404).send({ success: false, status: "not.found", msg: "QR Code not found", code: 20 });
		            else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
		        });
		    }
		    /*else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });*/
		};
	};
    apiRoutes.post("/qrcode/status", gstatus);
	function gstatus(request,response) {
		var token = request.body.token || request.query.token || request.headers["authorization"],
			_user;
        if (token) { _user = jwt.decode(token, config.secret); }
        else return response.status(403).send({ success: false, msg: ERRORS.NO_TOKEN.Text });

		if(!request.body.qrcode) { return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code }); }	
		else {
			AuthQR.findOne({ idAuth: request.body.qrcode }, function (err, sdbqr){

				if (!err && sdbqr) return response.status(200).send({ success: true, status: "is.saved", savedBy: sdbqr.savedBy, isUpdated: sdbqr.isUpdated, updatedBy: sdbqr.updatedBy, createdBy: sdbqr.createdBy, date: sdbqr.createdAt });
				else if (!sdbqr) return response.status(404).send({ success: false, status: "not.found", msg: "QR Code not found", code: 20 });
				else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
				
			});
		};
	};

};
