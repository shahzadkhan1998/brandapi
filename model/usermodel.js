const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    level: {
      type: Number,
      default: 1,
    },
    coins: {
      type: Number,
      default: 50,
      require:true
    },
  });
  
  const User = mongoose.model('User', userSchema);
  
  module.exports = User;
  