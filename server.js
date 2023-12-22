const app = require("./app");
const connectDatabase = require("./db/Database");
const keys = require("./config/keys");
const cloudinary = require("cloudinary");

//handling uncaught Exception
process.on("uncaughtException", (err) => {
	console.log(`Error: ${err.message}`);
	console.log(`shutting down the server for handling uncaught exception`)
});

// connect db
connectDatabase();

// config
if (process.env.NODE_ENV !== "production") {
	require("dotenv").config({
		path: ".env",
	});
}

//create server
const server = app.listen(keys.Port, () => {
	console.log(`server is running on http://localhost:${keys.Port}`);
});

// cloudinary config 
cloudinary.config({
	cloud_name: keys.CLOUDINARY_NAME,
	api_key: keys.CLOUDINARY_API_KEY,
	api_secret: keys.CLOUDINARY_API_SECRET
});



//unhandled promise rejection
process.on("unhandledRejection", (err) => {
	console.log(`shutting down the server for ${err.message}`);
	console.log(`shutting down the server for unhandled promise rejection`);
	server.close(() => {
		process.exitCode = 1;
	})
})