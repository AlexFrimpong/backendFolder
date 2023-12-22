const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Shop = require("../model/shop")
const asyncHandler = require('express-async-handler')

// T o ensure that users are authenticated before they can perform any activity like purchasing of products
exports.isAuthenticated = asyncHandler(async (req, res, next) => {

	try {
		const token = req.cookies.token;

		if (!token) {
			res.status(401)
			throw new Error('Not authorized, please login')
		}
		// verify token
		const decoded = await jwt.verify(token, process.env.jwtSecret);
		const user = await User.findById(decoded.id);

		if (!user) {
			res.status(401)
			throw new Error('User not found');

		}
		req.user = user
		next()
	} catch (error) {
		res.status(401)
		throw new Error('Not authorized, please login')

	}
})


// To ensure that the sellers authenticated before they can perform any action like adding new products 

exports.isSeller = asyncHandler(async (req, res, next) => {
	try {
		const token = req.cookies.token;
		if (!token) {
			res.status(401)
			throw new Error('Not authorized, please login')
		}
		// verify token
		const decoded = await jwt.verify(token, process.env.jwtSecret);
		const seller = await Shop.findById(decoded.id);
		if (!seller) {
			res.status(401)
			throw new Error('Seller not found');
		}
		req.seller = seller
		next()
	} catch (error) {
		res.status(401)
		throw new Error('Not authorized, please login')
	}
});


exports.isAdmin = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			res.status(401)
			throw new Error(`${req.user.role} can not access this 
resources!`)
		};
	}
}
