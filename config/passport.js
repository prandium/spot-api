var JwtStrategy = require("passport-jwt").Strategy;
var	ExtractJwt = require('passport-jwt').ExtractJwt;
var	User = require("../models/auth/user");
var	config = require("../config/database");
	
module.exports = function (passport) {
	var opt = {};
	opt.jwtFromRequest = ExtractJwt.fromAuthHeader();
	opt.secretOrKey = config.secret;
	passport.use(new JwtStrategy(opt, function (jwt_payload, done) {
		User.find({id: jwt_payload.id}, function (err, user){
			user.test = null;
			if (err)
				return done(err, false);
			if (user)
				done(null, user);
			else
				done(null, false);
		});
	}));
};