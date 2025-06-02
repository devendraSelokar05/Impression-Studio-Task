const express = require("express");
// const swaggerUi = require('swagger-ui-express');
// const swaggerSpec = require('./config/swagger');
const rateLimit = require("express-rate-limit")
const morgan = require('morgan')


const app = express();


app.use(morgan('dev'));

const limiter = rateLimit({
   windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later." }
})

app.use(limiter)

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  res.status(200).send("Hello World!");
});


//import routes

const userRoutes = require("./routes/user.routes");
const partnerVerificationRoutes = require("./routes/partner-verification.routes");
const categoriesRoutes = require("./routes/categories.routes");
const inquiryRoutes = require("./routes/inquiry.routes");
const portfolioRoutes = require("./routes/portfolio.routes");
const reviewRoutes = require("./routes/review.routes");
const adminRoutes = require("./routes/admin.routes");
const locationRoutes = require("./routes/location.routes");

//use routes
app.use("/api/auth", userRoutes);
app.use("/api/partner", partnerVerificationRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/inquiry", inquiryRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/location", locationRoutes);


//Swagger implementation
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
module.exports = app;
