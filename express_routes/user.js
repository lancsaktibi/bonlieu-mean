const express = require('express');
const router = express.Router();

// controller with scripts
const userController = require('../express_controllers/user');

// route for post requests under /api/user/signup
router.post("/signup", userController.createUser);

// route for post requests under /api/user/login
router.post("/login", userController.userLogin)

module.exports = router;
