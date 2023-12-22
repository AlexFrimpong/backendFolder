const express = require("express");
const path = require("path");
const User = require("../model/user");
const router = express.Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const { Error } = require("mongoose");
const { isAuthenticated } = require("../middleware/auth");
const { validationResult, check } = require('express-validator')
const asyncHandler = require('express-async-handler');
const cloudinary = require('../utils/cloudinary')

const getJwtToken = function (id) {
	return jwt.sign({ id }, process.env.jwtSecret, {
		expiresIn: '1d',
	});
};
//User validation
function userValidation() {
	return [
		check('name')
			.exists()
			.withMessage('username is required')
			.trim()
			.escape(),
		check('email')
			.isEmail().normalizeEmail().withMessage('You entered invalid email address')
			.exists(),
		check('password')
			.isLength({ min: 8 })
			.withMessage('Please your password must be at least 8 characters')
	]
}

router.post("/register-user", userValidation(), asyncHandler(async (req, res, next) => {

	const { name, email, password, avatar } = req.body;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(401).json({
			errors: errors.array()
		})
	}

	const userEmail = await User.findOne({ email });

	if (userEmail) {
		res.status(401)
		throw new Error("User already exist")
	}
	// const result = await cloudinary.uploader.upload(avatar, {
	// folder: "avatars",
	// width: 150
	// })

	const user = await User.create({
		name: name,
		email: email,
		password: password,
		// avatar: {
		// public_id: result.public_id,
		// url: result.secure_url
		// },
	})
	const token = getJwtToken(user._id)

	if (!user) {

		res.status(401)
		throw new Error('Something went wrong')
	}

	res.cookie("token", token, {
		httpOnly: true,
		//secure: true,
		//sameSite: 'none',
		expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
	})

	res.status(200).json({
		_id: user._id,
		name: user.name,
		email: user.email,
		role: user.role,
		token,
	});
}))

// login user 
router.post("/login-user",
	asyncHandler(async (req, res, next) => {

		const { email, password } = req.body;
		if (!email || !password) {
			res.status(401)
			throw new Error('Invalid credentials')
		}
		const user = await User.findOne({ email }).select('+password');

		if (!user) {
			res.status(400)
			throw new Error("User doesn't not exist");
		}
		const token = getJwtToken(user._id)
		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			res.status(400)
			throw new Error("Incorrect Password")
		};
		if (isPasswordValid && user) {
			res.cookie("token", token, {
				httpOnly: true,
				secure: true,
				sameSite: 'none',
				expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
			})
			res.status(201).json({
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				token,
				msg: 'You have successfully logged in!'
			})
		}
		else {
			res.status(401)
			throw new Error("User not found!!")
		}
	}));

// to keep the user still logged in when the cookie is not expired
router.get(
	"/getUserStatus",
	asyncHandler(async (req, res, next) => {
		// check whether the user id exists
		const token = req.cookies.token
		if (!token) {
			res.json(false)
		}
		const verified = await jwt.verify(token, process.env.jwtSecret);
		if (verified) {
			res.json(true)
		}
		else {
			res.json(false)
		}
	})
);

router.get("/getUser", asyncHandler(async (req, res) => {

	const user = await User.findById(req.user._id)
	if (user) {
		res.status(201).json(user)
	}
	res.status(401)
	throw new Error('User is not found')
}))

// logging user out
router.get("/logout",
	asyncHandler(async (req, res, next) => {
		try {
			res.cookie("token", null, {
				expires: new Date(Date.now()),
				httpOnly: true,
				sameSite: "none",
				secure: true
			});
			res.status(201).json({
				success: true,
				message: "Logged out successfully",
			});
		}
		catch (error) {
			res.status(401)
			throw new Error('Something went wrong so try again')

		}
	})
);

//User validation
function userUpdateValidation() {
	return [
		check('req.body.name')
			.exists()
			.withMessage('username is required')
			.trim()
			.escape(),
		check('req.body.email')
			.isEmail().normalizeEmail().withMessage('You entered invalid email address')
			.exists()
	]
}

router.patch("/updateUserDetails",
	isAuthenticated, userUpdateValidation(),
	asyncHandler(async (req, res, next) => {

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.send({
				errors: errors.array()
			})
		} else {

			const user = await User.findById(req.user._id)
			if (user) {
				const { name, email, contact, addresses } = user
				user.name = req.body.name || name
				user.email = req.body.email || email
				user.addresses = req.body.addresses || addresses
				user.contact = req.body.contact || contact
				const updateUser = await user.save()
				res.status(201).json({
					updateUser
				})
			}
			res.status(401)
			throw new Error('User not found')

		}
	}))

//update user avatar 
router.patch("/updateUserPhoto",
	isAuthenticated,
	asyncHandler(async (req, res, next) => {
		let userExists = await User.findById(req.user._id);
		if (userExists) {
			if (req.body.avatar !== "") {
				const imageId = userExists.avatar.public_id;
				await cloudinary.uploader.destroy(imageId);
				const myCloud = await cloudinary.uploader.upload(req.body.avatar, {
					folders: "avatars",
					width: 150
				});
				userExists.avatar = {
					public_id: myCloud.public_id,
					url: myCloud.secure_url
				};
				await userExists.save();

			}
		}
		else {
			res.status(401)
			throw new Error('No avatar exists')

		}
	})
);



module.exports = router