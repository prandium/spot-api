module.exports = function (apiRoutes) {

	var Comment = require("../../models/comments/comments"),
		ERRORS = require("../../constants/errors"),
		User = require("../../models/auth/user"),
		jwt = require("jwt-simple"),
		config = require("../../config/database")
		mongoose = require("mongoose");

    apiRoutes.get("/comments/getByStoreId", getByStoreId);
    function getByStoreId(request, response){
		var token = request.body.token || request.query.token || request.headers["authorization"],
			_user;        
        
        if (token) { _user = jwt.decode(token, config.secret); }
        else { return response.status(403).send({ success: false, message: ERRORS.NO_TOKEN.Text }); };
        Comment.find({ to: request.query.storeId, isActive: true }, function(err, _comments) {
			if (err) { return response.status(500).send(err); }								
			else {
				for (var i=0; i < _comments.length; i++) {		
					_comments[i]._doc.canEdit = false;					
								
					var id = mongoose.Types.ObjectId(_user._id);
					if (_comments[i].createdBy._id.id == id.id) {
						_comments[i]._doc.canEdit = true;
					};
				};
				return response.status(200).send(_comments); 
			};            	            
        }).populate("createdBy", "firstName lastName").sort([["createdAt", "1"]]);
    };

	apiRoutes.post("/comments/add", addComment);
	function addComment(request, response) {
		var token = request.body.token || request.query.token || request.headers["authorization"],
			_user;        
        
        if (token) { _user = jwt.decode(token, config.secret); }
        else return response.status(403).send({ success: false, message: ERRORS.NO_TOKEN.Text });

		if(!request.body.body) { return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code }); }	
		else {
			var newComment = new Comment({
				to: request.body.to, 		
                body: request.body.body,
                createdBy: _user._id,
                createdAt: new Date(),
                isActive: true
			});
			
			newComment.save(function(err) {
				if (err) { return response.status(500).send({success: false, msg: err}); }					
				else { return response.status(201).send({success: true, msg: "Comment added successfully."}); };					
			});
		};
	};	

    apiRoutes.put("/comments/update", updateComment);
	function updateComment(request, response) {
		var token = request.body.token || request.query.token || request.headers["authorization"],
			_user;        
        
        if (token) { _user = jwt.decode(token, config.secret); }
        else return response.status(403).send({ success: false, message: ERRORS.NO_TOKEN.Text });

		if(!request.body.body) { return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code }); }	
		else {
			Comment.findOne({ _id: request.body._id }, function (err, comment){
                if (!err) {							
                    comment.body = request.body.body;
                    comment.updatedAt = new Date();                
                    comment.updatedBy = _user._id;			
                    
                    comment.save(function (err) {
                        if(!err) return response.status(200).send({ success: true, msg: "Success" });				
                        else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
                    });
                }
                else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });			
            });			
		};
	};

	apiRoutes.put("/comments/delete", deleteComment);
	function deleteComment(request, response) {
		var token = request.body.token || request.query.token || request.headers["authorization"],
			_user;        
        
        if (token) { _user = jwt.decode(token, config.secret); }
        else return response.status(403).send({ success: false, message: ERRORS.NO_TOKEN.Text });

		Comment.findOne({ _id: request.body._id }, function (err, comment){
			if (!err) {							
				comment.isActive = false;			
				
				comment.save(function (err) {
					if(!err) return response.status(200).send({ success: true, msg: "Success" });				
					else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });
				});
			}
			else return response.status(400).send({ success: false, msg: ERRORS.SERVICE.Text, code: ERRORS.SERVICE.Code });			
		});					
	};
};