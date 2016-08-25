module.exports = function (apiRoutes, SignUp, LogIn/*, firstLogin, updateLoginStatus, EditUser, DeleteUser*/) {	
		
	apiRoutes.post("/signup", SignUp);
	apiRoutes.post("/login", LogIn);  
};