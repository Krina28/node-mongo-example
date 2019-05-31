/* var mongoose = require('../config/database'); */
var mongoose = require('mongoose');
const softDelete = require('mongoose-delete');
const mongoCrypt = require('mongoose-bcrypt');
// const bcrypt_p        = require('bcrypt-promise');
const bcrypt = require('bcrypt');
var uniqueValidator = require('mongoose-unique-validator');
const validate = require('mongoose-validator');
const { TE, to } = require('../services/util.service');
const jwt = require('jsonwebtoken');
//const constants = require('../config/constants');

/* USER MODEL SCHEMA */
var userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		trim: true,
		required: true
	},
	lastName: {
		type: String,
		trim: true,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true,
		index: true,
	},
	password: {
		type: String,
		select: false,
		min: 8,
		required: true,
		bcrypt: true
	},
	active: {
		type: Boolean,
		default: 1
	}/* ,
	verification_token:{
				type: String		
			} */
},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
	});

/* Virtual Fields */
userSchema.virtual('fullname').get(function () {
	return [this.firstName, this.lastName].filter(Boolean).join(' ');
});

/* Soft Delete */
userSchema.plugin(softDelete, { deletedAt: true, overrideMethods: true });

/* Password crypt */
userSchema.plugin(mongoCrypt, { rounds: 10 });

/* Unique Validator */
userSchema.plugin(uniqueValidator);

/* USER MODEL METHODS */

//Create User
userSchema.methods.createUser = function (cb) {
	var self = this;

	return self.save()
		.then(item => {
			return { success: 1, user: item };
		})
		.catch(err => {

			return { success: 0, err: err };
		});
}

//Compare Password
userSchema.methods.comparePassword = async function (pw) {
	let err, pass;

	if (!this.password) TE('Password not set');
	//console.log(pw);
	//console.log(bcrypt_p.compare(pw, this.password));
	// return bcrypt_p.compare(pw, this.password)
	// 		.then(function(err, same){
	// 			if(same) {
	// 				// console.log(same);
	// 				return same
	// 			} else {
	// 				console.log(err);
	// 			}
	// 		});

	/*  [err, pass] = await to(bcrypt_p.compare(pw, this.password));
	 if(err) TE(err);
 
	 if(!pass) TE('invalid password');
	 return pass; */

	/* return this; */
	let match = await bcrypt.compare(pw, this.password);
	console.log(match);
	return match;

}

//Delete User (SOFT DELETE) => mongodb: { deleted: true, deletedAt:timestamp }
userSchema.methods.deleteUser = function (user, cb) {
	var userId = mongoose.Types.ObjectId(user.objId);

	return User.deleteById(userId)
		.exec()
		.then(item => {
			return { success: 1, user: item };
		})
		.catch(err => {
			return { success: 0, err: err };
		});
}

//Restore User => mongodb: { deleted: false, deletedAt:null }
userSchema.methods.restoreUser = async function (req, callback) {
	return User.restore({ _id: mongoose.Types.ObjectId(req.objId) })
		.exec()
		.then(item => {
			return { success: 1, user: item };
		})
		.catch(err => {

			return { success: 0, err: err };
		});
}

/* Utility Methods */
userSchema.methods.getJWT = function () {
	let expiration_time = parseInt(process.env.JWT_EXPIRATION);
	// console.log();

	return "Bearer " + jwt.sign({ user_id: this._id }, process.env.JWT_ENCRYPTION, { expiresIn: expiration_time });
};
userSchema.methods.toWeb = function () {
	let json = this.toJSON();
	json.id = this._id;//this is for the front end
	return json;
};

/* USER MODEL CREATION */
var User = mongoose.model("User", userSchema);

module.exports = User;
