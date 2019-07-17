const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

require('dotenv').config();

const postsRoutes = require('./express_routes/posts');
const userRoutes = require('./express_routes/user');

const app = express();

// connect to db
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: 'true', useCreateIndex: 'true'})
  .then(() => {
    console.log('Connected to database!');
  })
  .catch(() => {
    console.log('Connection failed!');
  });

// middleware for parsing JSON data (+ urlencoded optional)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// provide access to the images folder
app.use("/images", express.static(path.join(__dirname, "images"))); // forward request to /images
// provide access to the angular folder
app.use("/", express.static(path.join(__dirname, "angular"))); // forward request to /angular

// middleware for CORS - Cross Origin Resource Sharing
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all other resources / domains to access data
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); // allow these headers in the request
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS"); // allow http methods
  next();
});

// use router and routes file
app.use("/api/posts", postsRoutes);
app.use("/api/user", userRoutes);

// any other routes: pass over to the angular app
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "angular", index.html));
})

module.exports = app;
