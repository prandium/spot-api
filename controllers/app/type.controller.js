module.exports = function (apiRoutes) {

	var Type = require("../../models/app/type"),
		User = require("../../models/auth/user"),
		jwt = require("jwt-simple"),
		config = require("../../config/database"),
		ERRORS = require("../../constants/errors");		
		
	apiRoutes.post("/type/add", addType);
	function addType(request, response) {
		var token = request.body.token || request.query.token || request.headers["authorization"],
			_user;        
        
        if (token) { 
			_user = jwt.decode(token, config.secret); 
		}
        else { 
			return response.status(403).send({ success: false, data: ERRORS.NO_TOKEN.Text, code: ERRORS.NO_TOKEN.Code }); 
		};

		User.findOne({ _id: _user._id }, function(err, user) {
			if (err) {
				return response.status(400).send({success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
			}; 			
			if (!user) {
				return response.status(400).send({success: false, msg: ERRORS.AUTH_USER_NOT_FOUND.Text, Code: ERRORS.AUTH_USER_NOT_FOUND.Code });
			};

			if (!user.isSuperadmin) {
				return response.status(403).send({ success: false, data: ERRORS.NOT_SUPERADMIN.Text, code: ERRORS.NOT_SUPERADMIN.Code })
			};		

			if(!request.body.name) { return response.status(400).send({ success: false, msgdata: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code }); }	
			else {
				var newType = new Type({
					name: request.body.name,
					image: request.body.image,
					position: request.body.position,
					isActive: true
				});
				
				newType.save(function(err) {
					if (err) { return response.status(500).send({success: false, msg: err}); }					
					else { return response.status(201).send({success: true, msg: "Item created successfully."}); };					
				});
			};								
		});		
	};

	apiRoutes.get("/type/getAll", getAll);
	function getAll(request, response) {
        Type.find({}, function(err, _menu) {
			if (err) { 
				return response.status(500).send({ success: false, msg: err }); 
			}				
			else { 
				return response.status(200).send({ success: true, data: _menu }); 
			};            	            
        });
    };	
};