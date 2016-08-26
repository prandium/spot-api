module.exports = function (apiRoutes) {

	var User = require("../../models/auth/user"),
	Role = require("../../models/roles/role"),	
	Company = require("../../models/companies/company"),
	jwt = require("jwt-simple"),
	config = require("../../config/database"),
	ERRORS = require("../../constants/errors");
	 	
	apiRoutes.post("/signup", signUp);
	function signUp(request, response) {                
        	
		if(!request.body.username || !request.body.password) { 
			return response.status(400).send({success: false, msg: ERRORS.USERNAME_PASS_EMPTY.Text, code: ERRORS.USERNAME_PASS_EMPTY.Code }); }	
		else {
			if (request.body.password !== request.body._password) { return response.status(400).send({success: false, msg: ERRORS.PASSWORDS_DIFF.Text, code: ERRORS.PASSWORDS_DIFF.Code }); }				
			if (!request.body.firstName || !request.body.lastName) { return response.status(400).send({success: false, msg: ERRORS.FIRST_LAST_NAME_EMPTY.Text, code: ERRORS.FIRST_LAST_NAME_EMPTY.Code }); };				
			
			var _User = new User({
				username: request.body.username.replace(" ", "").toLowerCase(),
				password: request.body.password,
				firstName: request.body.firstName,
				lastName: request.body.lastName,
				email: request.body.email,
				phone: request.body.phone,
				address: request.body.address,
				isActive: true,
				isSuperadmin: false
			});		

			var claims = {
				_id: _User._id
			};

			_User.save(function(err) {
				if (err) { return response.status(400).send({success: false, msg: ERRORS.USERNAME_NOT_AVAILABLE.Text, code: ERRORS.USERNAME_NOT_AVAILABLE.Code }); }
				else { 
					return response.status(200).send({ 
						success: true, 
						msg: ERRORS.USER_SUCCESSFULLY.Text, 
						code: ERRORS.USER_SUCCESSFULLY.Code, 
						data: { 
							token: jwt.encode(claims, config.secret),
							username: _User.username,
							firstName: _User.firstName,
							lastName: _User.lastName
						}
					}); 
				};
			});
		};
	};
		
	// POST
	apiRoutes.post("/signin", signIn);	                                                                                                                                   
	function signIn(request, response) {                 
		User.findOne({ username: request.body.username.toLowerCase() }, function(err, user) {
			if (err) { return response.status(400).send({success: false, msg: ERRORS.AUTH_FAILED.Text, code: ERRORS.AUTH_FAILED.Code }); }							
			if (!user) { return response.status(400).send({success: false, msg: ERRORS.AUTH_USER_NOT_FOUND.Text, code: ERRORS.AUTH_USER_NOT_FOUND.Code }); };							

			user.comparePassword(request.body.password, function(err, isMatch) {

				Company.find({'members.userId':user._id}, function(err, _companies) {
					if (err) { return response.status(500).send(err); }				
					else {  				
						var roles = [];

						for (var i = 0; i < _companies.length; i++) {
							for (var j = 0; j < _companies[i].members.length; j++){
								if (_companies[i].members[j].userId.id == user._id.id){
									roles.push({id: _companies[i]._id, roleId: _companies[i].members[j].roleId});
								};
							};
						};

						if (isMatch && !err) {
							var claims = {
								_id: user._id,
								roles: roles
							};

							var token = jwt.encode(claims, config.secret);                                                                                                                                                                                                                                          
							return response.status(200).send({
								success: true,
								data: {
									token: token, 
									username: user.username,
									firstName: user.firstName,
									lastName: user.lastName
								}
							});            					
						}
						else return response.status(403).send({success: false, msg: ERRORS.AUTH_WRONG_PASSWORD.Text, code: ERRORS.AUTH_WRONG_PASSWORD.Code });
					};            	            
				});
			});
		});
	};

	apiRoutes.put("/update", updateUser);
	function updateUser(request, response) {		
		User.findOne(request.params._id, function (err, user){
			if (!err) {			
				user.username = request.body.username;
				user.password = request.body.password;
				user.firstName = request.body.firstName;
				user.lastName = request.body.lastName;
				user.email = request.body.email;
				user.phone = request.body.phone;
				user.address = request.body.address;
				
				user.save(function (err) {
					if(!err) return response.status(200).send({ success: true, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });				
					else return response.status(400).send({ success: false, msg: ERRORS.EDIT_USER_SUCCESSFULLY.Text, code: ERRORS.EDIT_USER_SUCCESSFULLY.Code });
				});
			}
			else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });			
		});
	};
	
	// apiRoutes.put("/deleteuser", deleteUser);
	// function deleteUser(request, response) {
	// 	User.findOne(request.params._id, function (err, user) {
	// 		user.isActive = false;
	// 		user.save(function (err) {
	// 			if(!err) return response.status(200).send({ success: true, msg: "Success." });
	// 			else return response.status(400).send({ success: false, msg: "Failed." + err });
	// 		});
	// 	});
	// };
};