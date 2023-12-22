const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		lowercase: true,
		required: [true, "Please enter your name"]
	},
	email: {
		type: String,
		required: [true, "Please enter your email address"],
		unique: true,
		lowercase: true,
	},
	password: {
		type: String,
		required: [true, "Please enter your password"],
		minLength: [8, "Password should be at least 8 characters"],
		select: false
	},
	contact: {
		type: String

	},
	addresses: {

		region: {
			type: String
		},
		address: {
			type: String
		},
		country: {
			type: String
		}

	},
	role: {
		type: String,
		default: "user"
	},
	avatar: {
		public_id: {
			type: String,

		},
		url: {
			type: String,

		},
	},
	createAt: {
		type: Date,
		default: Date.now(),
	},
	resetPasswordToken: String,
	resetPasswordTime: Date
});

// hash password 
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		next()
	}
	this.password = await bcrypt.hash(this.password, 10);
});

// compare password 
userSchema.methods.comparePassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
}
const User = mongoose.model('myUsers', userSchema);

module.exports = User;