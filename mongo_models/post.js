const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  titleHu: { type: String, required: true },
  titleEn: { type: String, required: true },
  contentHu: { type: String, required: true },
  contentEn: { type: String, required: true },
  imagePath: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

module.exports = mongoose.model('Post', postSchema);
