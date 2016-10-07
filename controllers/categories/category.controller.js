module.exports = function (apiRoutes) {

	var Category = require("../../models/categories/category"),
		User = require("../../models/auth/user"),
		jwt = require("jwt-simple"),
		config = require("../../config/database"),
		ERRORS = require("../../constants/errors");		
		
	apiRoutes.post("/category/add", addCategory);
	function addCategory(request, response) {
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
				var newCategory = new Category({
					name: request.body.name,
					icon: request.body.icon,
					isActive: true
				});
				
				newCategory.save(function(err) {
					if (err) { return response.status(500).send({success: false, msg: err}); }					
					else { return response.status(201).send({success: true, msg: "Category created successfully."}); };					
				});
			};								
		});		
	};

	apiRoutes.put("/category/update", update);
	function update() {
		var token = request.body.token || request.query.token || request.headers["authorization"],
			_user;        
        
        if (token) { _user = jwt.decode(token, config.secret); }
        else return response.status(403).send({ success: false, message: ERRORS.NO_TOKEN.Text });

		Category.findOne({ _id: request.body._id }, function (err, category){
			if (!err) {							
				category.name = request.body.name;
				category.icon = request.body.icon;
				
				category.save(function (err) {
					if(!err) return response.status(200).send({ success: true, data: "Success" });				
					else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
				});
			}
			else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });			
		});
	};

	apiRoutes.get("/category/getAll", getAll);
	function getAll(request, response) {
        Category.find({}, function(err, _category) {
			if (err) { 
				return response.status(500).send({ success: false, msg: err }); 
			}				
			else { 
				return response.status(200).send({ success: true, data: _category }); 
			};            	            
        });
    };	
};