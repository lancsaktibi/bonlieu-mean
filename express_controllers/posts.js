// CRUD functions for posts

const Post = require('../mongo_models/post');

exports.createPost = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host'); // create the file url up until the host
  const post = new Post({
    titleHu: req.body.titleHu,
    titleEn: req.body.titleEn,
    contentHu: req.body.contentHu,
    contentEn: req.body.contentEn,
    imagePath: url + '/images/' + req.file.filename,
    owner: req.userData.userId
  }); // from bodyParser.json -- file.filename comes from multer
  post.save()
    // pick the ID of the saved document from the db and return it in the json
    .then(createdPost => {
      res.status(201).json({
        message: 'Post added successfully',
        post: {
          ...createdPost,
          id: createdPost._id
        } // nextgen javascript feature: copy createdPost to post, then add id again wo underscore
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Creating a post failed!'
      });
    });
  }

exports.readPosts = (req, res, next) => {
  // capture query parameters
  const pageSize = +req.query.pagesize; // + turns string to number
  const currentPage = +req.query.page; // + turns string to number
  const postQuery = Post.find(); // pass parameters to this const
  if (pageSize && currentPage) { // if parameters exist: query a slice for the given page
    postQuery
      .skip(pageSize * (currentPage - 1)) // skip first posts
      .limit(pageSize); // only retrieve n posts
  }
  // execute query
  postQuery.then(documents => {
    fetchedPosts = documents; // to store the posts
    return Post.estimatedDocumentCount(); // to count the total posts
  })
  .then(count => {
    res.status(200).json({
      message: 'Posts fetched successfully!',
      posts: fetchedPosts,
      maxPosts: count
    });
  })
  .catch(error => {
    res.status(500).json({
      message: 'Fetching posts failed!'
    })
  });
}

exports.readPost = (req, res, next) => {
  Post.findById(req.params.id)
    .then(post => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(400).json({message: 'Post not found!'});
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching post failed!'
      })
    });
}

exports.updatePost = (req, res, next) => {
  // check if new image file added or we receive image file path only
  let imagePath = req.body.imagePath; // use the file path received from the frontend (old path)
  if (req.file) {
    const url = req.protocol + '://' + req.get('host'); // create the file url up until the host
    imagePath = url + '/images/' + req.file.filename // file.filename comes from multer
  }
  // move from req to post layout
  const post = new Post({
    _id: req.body.id,
    titleHu: req.body.titleHu,
    titleEn: req.body.titleEn,
    contentHu: req.body.contentHu,
    contentEn: req.body.contentEn,
    imagePath: imagePath,
    owner: req.userData.userId
  }); // keep original userID
  // updateOne() conditions: {_id=id + owner = userID} -- this is for authorization
  Post.updateOne({_id: req.params.id, owner: req.userData.userId}, post)
    .then(result => {
      // check if count > 0 -- or post not found
      if (result.n > 0) {
        res.status(200).json({ message: "Update successful! "});
      } else {
        res.status(401).json({ message: "User not authorized to update! "});
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Couldn't update post!"
      })
    })
}

exports.destroyPost = (req, res, next) => {
  // deleteOne() conditions: {_id=id + owner = userID} -- this is for authorization
  Post.deleteOne({ _id: req.params.id, owner: req.userData.userId })
    .then(result => {
      // check if deleted count > 0 -- or nothing changed
      if (result.n > 0) {
        res.status(200).json({ message: "Post deleted! "});
      } else {
        res.status(401).json({ message: "User not authorized to delete! "});
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Deleting post failed!'
      })
    });
}
