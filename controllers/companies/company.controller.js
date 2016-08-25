module.exports = function (apiRoutes) {

	var Company = require("../../models/companies/company"),
		ERRORS = require("../../constants/errors");		
		
	apiRoutes.post("/companies/add", addCompany);
	function addCompany(request, response) {                  	
		if(!request.body.name) { return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code }); }	
		else {
			var newCompany = new Company({
				name: request.body.name,
                description: request.body.description,
                logo: request.body.logo,
                members: request.body.members,
                isActive: true,
                createdAt: new Date().getUTCDate(),
                updatedAt: null,
                createdBy: null,
                updatedBy: null
			});
			
			newCompany.save(function(err) {
				if (err) { return response.status(500).send({success: false, msg: err}); }					
				else { return response.status(201).send({success: true, msg: "Role created successfully."}); };					
			});
		};
	};

	apiRoutes.get("/companies/getAll", getAll);
	function getAll(request, response) {
        Company.find({}, function(err, _company) {
			if (err) { return response.status(500).send(err); }				
			else { return response.status(200).send(_company); };            	            
        });
    };	
};