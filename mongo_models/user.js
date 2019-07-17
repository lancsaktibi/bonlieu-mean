const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// add unique validator to the user schema -- to check email
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
