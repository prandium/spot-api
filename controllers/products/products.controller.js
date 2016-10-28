module.exports = function (apiRoutes) {

	var Product = require("../../models/products/products"),
		Role = require("../../models/roles/role"),
		User = require("../../models/auth/user"),	
		jwt = require("jwt-simple"),
		config = require("../../config/database"),
		ERRORS = require("../../constants/errors");		
		
	apiRoutes.post("/products/add", addProduct);
	function addProduct(request, response) {
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

			if(!request.body.name) { return response.status(400).send({ success: false, msg: ERRORS.REQUEST_FAILED.Text, code: ERRORS.REQUEST_FAILED.Code }); }	
			else {
				var newProduct = new Product({
					name: request.body.name,
					description: request.body.description,
					ingredients: request.body.ingredients,
					images: request.body.imageId,    
					price: request.body.price,
					tags: request.body.tags,
					isActive: true,    
					company: request.body.companyId,
					createdAt: new Date().getUTCDate(),
					updatedAt: null,
					createdBy: _user._id,
					updatedBy: null
				});
				
				newProduct.save(function(err) {
					if (err) { return response.status(500).send({success: false, data: err}); }					
					else { return response.status(201).send({success: true, data: "Product added successfully."}); };					
				});
			};								
		});		
	};

	apiRoutes.get("/products/getAll", getAll);
	function getAll(request, response) {
        Product.find({}, function(err, _menu) {
			if (err) { 
				return response.status(500).send(err); 
			}				
			else { 
				return response.status(200).send(_menu); 
			};            	            
        });
    };

	apiRoutes.get("/products/getByCompanyId", getById);
	function getById(request, response) {				
		var token = request.body.token || request.query.token || request.headers["authorization"],
			_user;        
        
        if (token) { 
			_user = jwt.decode(token, config.secret); 
		}		
        else { 
			return response.status(403).send({ success: false, data: ERRORS.NO_TOKEN.Text, code: ERRORS.NO_TOKEN.Code }); 
		};

        Product.find({ company: request.query._id }, function(err, store){
			if (err) { return response.status(500).send(err); }				
			else { return response.status(200).send(store); };      
		});
    };	
};