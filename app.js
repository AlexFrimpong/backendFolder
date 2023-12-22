const express = require("express");
const app = express();
const { notFound, errorHandler } = require('./middleware/errorHandler')
const cookieParser = require("cookie-parser");
const user = require("./controller/user");

// const shop = require("./controller/shop");
// const product = require("./controller/product");
// const event = require("./controller/event");
// const coupon = require("./controller/couponCode");
// const payment = require("./controller/payment");
// const order = require("./controller/order");
// const conversation = require("./controller/conversation");
// const message = require("./controller/message");
// const withdraw = require("./controller/withdraw");

const cors = require("cors");
app.use(cors({
	origin: ["http://localhost:3000",],
	credentials: true
}));

app.options('/*', (_, res) => { res.sendStatus(200); })

// app.use((req, res, next) => {
// res.header("Access-Control-Allow-Origin", "http://localhost:3000");
// res.header("Access-Control-Allow-Header", "Origin-With, Content-Type, Accept");
// next()
// })

const { SchemaTypeOptions } = require("mongoose");
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(express.json({ limit: '100mb', type: 'application/json' }));
app.use(cookieParser());

app.use("/api/e-commerce/users", user);
// app.use("/api/e-commerce/shop", shop);
// 
// app.use("/api/e-commerce/conversation", conversation);
// app.use("/api/e-commerce/message", message);
// app.use("/api/e-commerce/order", order);
// app.use("/api/e-commerce/product", product);
// app.use("/api/e-commerce/event", event);
// app.use("/api/e-commerce/coupon", coupon);
// app.use("/api/e-commerce/payment", payment);
// app.use("/api/e-commerce/withdraw", withdraw);
// 
// it is for error handling
app.use(notFound);
app.use(errorHandler);
module.exports = app;