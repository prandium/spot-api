module.exports = function (apiRoutes) {

	var Company = require("../../models/companies/company"),
		ERRORS = require("../../constants/errors");		
		
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
                isActive: false,
				location: request.body.location,
    			address: request.body.address,
				type: request.body.type,
                createdAt: new Date().getUTCDate(),				
                updatedAt: null,
                createdBy: _user._id,
                updatedBy: null				
			});
			
			newCompany.save(function(err) {
				if (err) { return response.status(500).send({success: false, msg: err}); }					
				else { return response.status(201).send({success: true, msg: "Role created successfully."}); };					
			});
		};
	};

	apiRoutes.get("/companies/update", update);
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

	apiRoutes.get("/companies/getAll", getAll);
	function getAll(request, response) {
        Company.find({}, function(err, _company) {
			if (err) { return response.status(500).send(err); }				
			else { return response.status(200).send(_company); };            	            
        });
    };	
};