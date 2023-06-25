const mongoose = require('mongoose');

const brandLogoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String, // Assuming you store the image URL
    required: true
  },
  relatedCharacters: {
    type: [String],
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  hint: {
    type: [String],
    required: true
  },
  bomb: {
    type: [String],
    required: true
  },
  right:{
    type:[String],
    require:true,
  }
});

const BrandLogo = mongoose.model('BrandLogo', brandLogoSchema);

module.exports = BrandLogo;