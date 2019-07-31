// bcrypt to hash password
const bcrypt = require('bcryptjs');

// JWT to manage json web token
const jwt = require('jsonwebtoken');

// import env file with JWT_KEY
require('dotenv').config();

// import user model
const User = require('../mongo_models/user');

// script for post requests under /api/user/signup
exports.createUser = (req, res, next) => {
  // read in data from the frontend
  // password should be encrypted -- 10 is for mid hash complexity
  // save user after hash generated
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(result => {
          res.status(201).json({
            message: 'User created!',
            result: result
          });
        })
        .catch(err => {
          res.status(500).json({
            message: 'Invalid authentication credentials!'
          });
        });
    })
}

// script for post requests under /api/user/login
exports.userLogin = (req, res, next) => {
  let fetchedUser; // create high level variable to be used across .then blocks
  // check whether email exists in db
  User.findOne({ email: req.body.email })
    // success for findOne()
    .then(user => {
      // store user in fetchedUser
      fetchedUser = user;
      // compare password with hash and return
      bcrypt.compare(req.body.password, user.password)
        // success for compare() -- store it in 'result'
        // compare() always succeeds -- it is either true or false
        .then(result => {
          // false: return with error
          if (!result) {
            return res.status(401).json({
              message: 'Invalid authentication credentials!'
            })
          }
          // true: generate webtoken with JWT
          // payload: email, userid
          // secret
          // configuration: expire in 1h
          const token = jwt.sign(
            {email: fetchedUser.email, userId: fetchedUser._id},
            process.env.JWT_KEY,
            {expiresIn: '1h'}
          );
          // send token + expiration (in seconds -- optional) + userID to the frontend
          return res.status(200).json({
            token: token,
            expiresIn: 3600,
            userId: fetchedUser._id
          })
        })
        // fail for compare() -- never happens: always success (true/false)
        // but catch always needed to prevent JS error 'unhandled promise'
        .catch(err => {
          return res.status(401).json({
            message: 'Invalid authentication credentials 2!'
          })
        })
      })
    // fail for findOne()
    .catch(err => {
      return res.status(401).json({
        message: 'Authentication error - email not registered!'
      })
    })
}
