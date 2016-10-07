module.exports = function (apiRoutes) {

	var Menu = require("../../models/app/menu"),
		Role = require("../../models/roles/role"),
		User = require("../../models/auth/user"),	
		jwt = require("jwt-simple"),
		config = require("../../config/database"),
		ERRORS = require("../../constants/errors");		
		
	apiRoutes.post("/menu/add", addMenu);
	function addMenu(request, response) {
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
				var newMenuItem = new Menu({
					name: request.body.name,
					icon: request.body.icon,
					selected: false,
					position: request.body.position,
					isDefault: request.body.isDefault,
					isActive: true,
					path: request.body.path,
					protectedLevel: request.body.protectedLevel
				});
				
				newMenuItem.save(function(err) {
					if (err) { return response.status(500).send({success: false, data: err}); }					
					else { return response.status(201).send({success: true, data: "Menu created successfully."}); };					
				});
			};								
		});		
	};

	apiRoutes.get("/menu/getAll", getAll);
	function getAll(request, response) {
        Menu.find({}, function(err, _menu) {
			if (err) { 
				return response.status(500).send(err); 
			}				
			else { 
				return response.status(200).send(_menu); 
			};            	            
        });
    };	

	apiRoutes.get("/menu/getMenuItems", getMenuItems);
	function getMenuItems(request, response) {
		var token = request.body.token || request.query.token || request.headers["authorization"],
			_user,
			menu = [];        
        
        if (token) { 
			_user = jwt.decode(token, config.secret); 
		}
        else { 
			return response.status(403).send({ success: false, data: ERRORS.NO_TOKEN.Text, code: ERRORS.NO_TOKEN.Code }); 
		};

		if (!_user.roles) {
			return response.status(403).send({ success: false, data: ERRORS.INVALID_TOKEN.Text, code: ERRORS.INVALID_TOKEN.Code })
		}

		if (_user.isSuperadmin) {
			Menu.find({ isActive: true }, function (err, _menu) {
				if (err) {
					return response.status(500).send({ success: false, data: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
				};
				return response.status(200).send({ success: true, data: _menu });
			});
		};			

		var rolesLength = _user.roles.length;
		if (rolesLength == 0) {
			Menu.find({ isActive: true, protectedLevel: 0 }, function(err, _menu) {
				if (err) {
					return response.status(500).send({ success: false, data: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
				};
				return response.status(200).send({ success: true, data: _menu });
			});				
		};

		for (var i=0; i<rolesLength;i++) {
			if (_user.roles[i].roleId) {
				Role.findOne({ _id: _user.roles[i].roleId, isActive: true }, function(err, role){
					if (role == null) {
						Menu.find({ isActive: true, protectedLevel: 0 }, function(err, _menu) {
							if (err) {
								return response.status(500).send({ success: false, data: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
							};
							return response.status(200).send({ success: true, data: _menu });
						});				
					} else {
						if (role.adminGroup) {
							Menu.find({ isActive: true, protectedLevel: 2 }, function(err, _menu) {
								if (err) {
									return response.status(500).send({ success: false, data: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
								};
								return response.status(200).send({ success: true, data: _menu });
							});
						}; 
						
						if (role.employeeGroup) {
							Menu.find({ isActive: true, protectedLevel: 1 }, function(err, _menu) {
								if (err) {
									return response.status(500).send({ success: false, data: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
								};
								return response.status(200).send({ success: true, data: _menu });
							});
						};
						
						if (role.isDefault) {
							Menu.find({ isActive: true, protectedLevel: 0 }, function(err, _menu) {
								if (err) {
									return response.status(500).send({ success: false, data: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
								};
								return response.status(200).send({ success: true, data: _menu });
							});				
						};
					};
				});				
			};
		};			
	};
};