// CRUD routes for posts

const express = require('express');
const jwtAuth = require('../express_middleware/jwt_auth');
const fileUpload = require('../express_middleware/file_upload');

// controller with scripts
const postsController = require('../express_controllers/posts');

const router = express.Router();

// Create for /api/posts with jwt_auth and file_upload middleware
router.post('', jwtAuth, fileUpload, postsController.createPost);

// Read all for /api/posts
router.get('', postsController.readPosts);

// Read single for /api/posts/:id
router.get('/:id', postsController.readPost);

// Update for /api/posts/:id with jwt_auth and file_upload middleware
router.put("/:id", jwtAuth, fileUpload, postsController.updatePost);

// Destroy for /api/posts/:id
router.delete('/:id', jwtAuth, postsController.destroyPost);

module.exports = router;
