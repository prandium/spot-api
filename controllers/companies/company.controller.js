module.exports = function (apiRoutes) {

	var Company = require("../../models/companies/company"),
		Type = require("../../models/app/type"),
		ERRORS = require("../../constants/errors")
		User = require("../../models/auth/user"),
		Ranking = require("../../models/companies/ranking"),
		jwt = require("jwt-simple"),
		config = require("../../config/database");		
		
	apiRoutes.post("/companies/add", addCompany);
	function addCompany(request, response) {
		var token = request.body.token || request.query.token || request.headers["authorization"],
			_user;        
        
        if (token) { _user = jwt.decode(token, config.secret); }
        else return response.status(403).send({ success: false, message: ERRORS.NO_TOKEN.Text });

		if(!request.body.name) { return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code }); }	
		else {
			var newCompany = new Company({
				name: request.body.name,
				description: request.body.description,
				logo: request.body.logo,
				members: request.body.members,
				isActive: true,
				location: request.body.location,
				address: request.body.address,
				city: request.body.city,
				state: request.body.state,
				categories: request.body.categories,
				createdAt: new Date().getUTCDate(),
				updatedAt: null,
				createdBy: _user._id,
				updatedBy: null,
				ranking: 0,
				privateKey: request.body.privateKey,
				publicKey: request.body.publicKey,
				allowCreditCard: request.body.allowCreditCard,
				plan: request.body.plan				
			});
			
			newCompany.save(function(err) {
				if (err) { return response.status(500).send({success: false, msg: err}); }					
				else { return response.status(201).send({success: true, msg: "Company added successfully."}); };					
			});
		};
	};	

	apiRoutes.get("/companies/getStores", getStores);
	function getStores(request, response) {	
		var _categories = [];
		if (request.query.typeId) {
			Type.findOne({ _id: request.query.typeId }, function (err, type) {
				for (var i=0; i < type.categories.length; i++) {
					_categories.push(type.categories[i]);
				};

				Company.find( request.query.lastId 
					? { $and : [filter(request.query, _categories), { "_id" : { $gt: request.query.lastId } }] } 
					: filter(request.query, _categories)			
					, function(err, _company) {
						if (err) { return response.status(500).send(err); }				
						else { return response.status(200).send(_company); };            	            
				}).limit(parseInt(request.query.pageSize));
			});
		} 
		else {
			Company.find( request.query.lastId 
				? { $and : [filter(request.query, _categories), { "_id" : { $gt: request.query.lastId } }] } 
				: filter(request.query, _categories)			
				, function(err, _company) {
					if (err) { return response.status(500).send(err); }				
					else { return response.status(200).send(_company); };            	            
			}).limit(parseInt(request.query.pageSize));
		};
    };

	apiRoutes.get("/store/getById", getById);
	function getById(request, response) {				
        Company.findOne({ _id: request.query._id }, function(err, store){
			if (err) { return response.status(500).send(err); }				
			else { return response.status(200).send(store); };      
		});
    };	

	apiRoutes.put("/companies/update", update);
	function update() {
		var token = request.body.token || request.query.token || request.headers["authorization"],
			_user;        
        
        if (token) { _user = jwt.decode(token, config.secret); }
        else return response.status(403).send({ success: false, message: ERRORS.NO_TOKEN.Text });

		Company.findOne({ _id: request.query._id }, function (err, company){
			if (!err) {							
				company.name= request.body.name;
                company.description= request.body.description;
                company.logo= request.body.logo;
                company.members= request.body.members;                
				company.location= request.body.location;
    			company.address= request.body.address;
				company.type= request.body.type;
                company.updatedAt= new Date().getUTCDate();                
                company.updatedBy= _user._id;			
				
				company.save(function (err) {
					if(!err) return response.status(200).send({ success: true, data: "Success" });				
					else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
				});
			}
			else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });			
		});
	};

	apiRoutes.put("/companies/activate", activate);
	function activate() {
		var token = request.body.token || request.query.token || request.headers["authorization"],
			_user;        
        
        if (token) { _user = jwt.decode(token, config.secret); }
        else return response.status(403).send({ success: false, message: ERRORS.NO_TOKEN.Text });

		Company.findOne({ _id: request.body._id }, function (err, company){
			if (!err) {							
				company.isActive= true;
				
				company.save(function (err) {
					if(!err) return response.status(200).send({ success: true, data: "Success" });				
					else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
				});
			}
			else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });			
		});
	};
	
	apiRoutes.put("/companies/vote", vote);
	function vote() {
		var token = request.body.token || request.query.token || request.headers["authorization"],
			_user;        
        
        if (token) { _user = jwt.decode(token, config.secret); }
        else return response.status(403).send({ success: false, message: ERRORS.NO_TOKEN.Text });

		Company.findOne({ _id: request.body.companyId }, function (err, company){
			if (!err) {															
				
				company.ranking = 0;

				if(!err) {
					Ranking.count({ companyId: request.body.companyId }, function(_err, count) {
						


						company.save(function (_err) {
							if(!_err) return response.status(200).send({ success: true, data: "Success" });				
							else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
						});

					});
				};								
			}
			else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });			
		});
	};

	apiRoutes.get("/companies/getAll", getAll);
	function getAll(request, response) {
        Company.find({}, function(err, _company) {
			if (err) { return response.status(500).send(err); }				
			else { return response.status(200).send(_company); };            	            
        });
    };		

	// FILTERS
	function filter(query, categories) {

		return    !query.longitude && !query.latitude && !query.text && !query.categoryId && !query.typeId
				? {}
				: !query.longitude && !query.latitude && !query.text && query.categoryId && !query.typeId
				? filterByCategory(query.categoryId)
				: !query.longitude && !query.latitude && query.text && !query.categoryId && !query.typeId
				? filterByName(query.text)
				: !query.longitude && !query.latitude && query.text && query.categoryId && !query.typeId
				? { $and: [ filterByCategory(query.categoryId), filterByName(query.text) ] }
				: query.longitude && query.latitude && !query.text && query.categoryId && !query.typeId
				? { $and: [ filterByLocation(query.longitude, query.latitude), filterByCategory(query.categoryId)] }
				: query.longitude && query.latitude && query.text && !query.categoryId && !query.typeId
				? { $and: [ filterByLocation(query.longitude, query.latitude), filterByName(query.text)] }
				: query.longitude && query.latitude && query.text && query.categoryId && !query.typeId
				? { $and: [ filterByLocation(query.longitude, query.latitude), filterByCategory(query.categoryId), filterByName(query.text)] }
				: !query.longitude && !query.latitude && !query.text && !query.categoryId && query.typeId
				? filterByType(categories)
				: !query.longitude && !query.latitude && query.text && !query.categoryId && query.typeId
				? { $and: [ filterByType(categories), filterByName(query.text) ] }
				: query.longitude && query.latitude && !query.text && !query.categoryId && query.typeId
				? { $and: [ filterByLocation(query.longitude, query.latitude), filterByType(categories)] }
				: query.longitude && query.latitude && query.text && !query.categoryId && query.typeId
				? { $and: [ filterByLocation(query.longitude, query.latitude), filterByName(query.text), filterByType(categories)] }
				: {}
	}

	function filterByType(categories) {
		return {
			categories: { $in : categories }
		}
	}

	function filterByLocation(longitude, latitude){
		return { location:
			{ $near :
				{              
					$geometry: { type: "Point",  coordinates: [ longitude, latitude] },            
					$maxDistance: 5000
				}
			}
		}
	}

	function filterByName(name) {
		return {"name" : {$regex : ".*" + name + ".*", '$options' : 'i'}}
	};

	function filterByCategory(categoryId) {
		return { categories : categoryId } 
	}
};