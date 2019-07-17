const express = require('express');
const router = express.Router();

// bcrypt to hash password
const bcrypt = require('bcryptjs')

// import user model
const User = require('../mongo_models/user');

// route for post requests under /api/user
router.post("/signup", (req, res, next) => {
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
            error: err
          });
        });
    })

});

module.exports = router;
