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
      validate: {
        validator: function (value) {
          // Basic email validation using a regular expression
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: 'Invalid email format',
      },

      
    },
    password: {
      type: String,
      required: true,
      validate:{
        validator: function (value) {
          return value.length >= 8;
        },
        message:'Password should be at least 8 characters long',

      }
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
  