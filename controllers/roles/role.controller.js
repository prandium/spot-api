module.exports = function (apiRoutes) {

	var Role = require("../../models/roles/role"),
		ERRORS = require("../../constants/errors");		
		
	apiRoutes.post("/roles/add", createRole);
	function createRole(request, response) {                  	
		if(!request.body.name) { return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code }); }	
		else {
			var newRole = new Role({
				name: request.body.name,
				canDelete: request.body.canDelete,
				canRead: request.body.canRead,
				canEdit: request.body.canEdit,
				canCreate: request.body.canCreate,
				default: request.body.default
			});
			
			newRole.save(function(err) {
				if (err) { return response.status(500).send({success: false, msg: err}); }					
				else { return response.status(201).send({success: true, msg: "Role created successfully."}); };					
			});
		};
	};

	apiRoutes.get("/roles/getAll", getAll);
	function getAll(request, response) {
        Role.find({}, function(err, _roles) {
			if (err) { return response.status(500).send(err); }				
			else { return response.status(200).send(_roles); };            	            
        });
    };	
};