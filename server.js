/* Dependencies */
var express = require("express"),
	mongoose = require("mongoose"),
	bodyParser = require("body-parser"),
	morgan = require("morgan"),
	passport = require("passport"),	
	config = require("./config/database"),
	apiRoutes = express.Router(),
	server = express(),	
	port = 3000;

mongoose.connect(config.database, function (error, response) {
	if (error) 
		console.log("Error: " + error);				
	else 
		console.log("The server is running now. ");
});

/* Static */
server.use(express.static('media'));
server.use(express.static('thumbnail'));

server.use(function(req, res, next) {
    res.header("Access-Control-Allow-Credentials", false);
    res.header("Access-Control-Allow-Origin",  '*');
    res.header("Access-Control-Allow-Headers", (req.headers['access-control-request-headers']) ? req.headers['access-control-request-headers'] : "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", (req.headers['access-control-request-method']) ? req.headers['access-control-request-method'] : "POST, GET, PUT, DELETE, OPTIONS");
	next();
});

server.use(bodyParser.urlencoded({extended: false}));
server.use(bodyParser.json());

server.use(morgan("dev"));

server.use(passport.initialize());

server.get("/", function (request, response) {
	response.send("API");
});

server.use("/api", apiRoutes);

server.use('/media', express.static(__dirname + '/media'));

server.listen(process.env.PORT || port);

require("./config/passport")(passport);

require("./controllers/auth/user.controller")(apiRoutes);
require("./controllers/companies/company.controller")(apiRoutes);
require("./controllers/roles/role.controller")(apiRoutes);
require("./controllers/uploads/upload.controller")(apiRoutes);
require("./controllers/app/menu.controller")(apiRoutes);
require("./controllers/app/type.controller")(apiRoutes);
require("./controllers/categories/category.controller")(apiRoutes);
require("./controllers/products/products.controller")(apiRoutes);
require("./controllers/qrcode/auth.controller")(apiRoutes);
