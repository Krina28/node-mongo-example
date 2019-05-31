var jwt = require('jwt-simple');
var validateUser = require('../controllers/admin/auth').validateUser;
const constants = require('../config/constants');

module.exports = function (req, res, next) {
	// When performing a cross domain request, you will recieve
	// a preflighted request first. This is to check if our the app
	// is safe. 
	// We skip the token outh for [OPTIONS] requests.
	//if(req.method == 'OPTIONS') next();

	var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
	var client_key = (req.body && req.body.client_key) || (req.query && req.query.client_key) || req.headers['client-key'];

	if (token && client_key) {
		try {
			var decoded = jwt.decode(token, require('../config/secret')());
			if (decoded.exp <= Date.now()) {
				//res.status(400);
				res.json({
					"status": constants.bad_request_code,
					"message": constants.token_expired
				});
				return;
			}

			// Authorize the user to see if s/he can access our resources
			var dbUser = validateUser(token, client_key, req); // The key would be the logged in user's username
			if (dbUser) {

				if ((req.url.indexOf('admin') >= 0 && dbUser.p2p_role_id != '1') || (req.url.indexOf('admin') < 0 && req.url.indexOf('/api/v1/') >= 0)) {

					next(); // To move to next middleware
				} else {
					//res.status(403);
					res.json({
						"status": constants.forbidden_code,
						"message": constants.unauthorized
					});
					return;
				}
			} else {
				// No user with this name exists, respond back with a 401
				//res.status(401);

				res.json({
					"status": constants.unauthorized_code,
					"message": constants.invalid_login_credentials
				});
				return;
			}
		} catch (err) {
			//res.status(500);
			res.json({
				"status": constants.server_error_code,
				"message": constants.server_error,
				"error": err
			});
		}
	} else {
		//res.status(401);
		res.json({
			"status": constants.unauthorized_code,
			"message": constants.server_error
		});
		return;
	}

	module.exports = function (req, res, next) {
		// When performing a cross domain request, you will recieve a preflighted
		// request first. This is to check if our the app is safe. We skip the token
		// outh for [OPTIONS] requests. if(req.method == 'OPTIONS') next();
		var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
		var client_key = (req.body && req.body.client_key) || (req.query && req.query.client_key) || req.headers['client-key'];

		if (token && client_key) {
			try {
				var decoded = jwt.decode(token, require('../config/secret')());
				if (decoded.exp <= Date.now()) {

					//res.status(400);
					res.json({ "status": constants.bad_request_code, "message": constants.token_expired });
					return;
				}

				// Authorize the user to see if s/he can access our resources
				var dbUser = validateUser(token, client_key, req); // The key would be the logged in user's username
				if (dbUser) {

					if ((req.url.indexOf('admin') >= 0 && dbUser.p2p_role_id != '1') || (req.url.indexOf('admin') < 0 && req.url.indexOf('/api/v1/') >= 0)) {

						next(); // To move to next middleware
					} else {
						//res.status(403);
						res.json({ "status": constants.forbidden_code, "message": constants.unauthorized });
						return;
					}
				} else {
					// No user with this name exists, respond back with a 401 res.status(401);
					res.json({ "status": constants.unauthorized_code, "message": constants.invalid_login_credentials });
					return;
				}
			} catch (err) {
				//res.status(500);
				res.json({ "status": constants.server_error_code, "message": constants.server_error, "error": err });
			}
		} else {
			//res.status(401);
			res.json({ "status": constants.unauthorized_code, "message": constants.server_error });
			return;
		}
	}
}
