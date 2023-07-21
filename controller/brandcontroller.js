const BrandLogo = require("../model/brandmodel.js");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const fs = require("fs");

// POST /logos
exports.createLogo = async (req, res) => {
  try {
   

    const { name, image, relatedCharacters, level, hint, bomb, right } =
      req.body;
    console.log(image);
     // Check if a brand with the given name already exists in the database
     const existingBrand = await BrandLogo.findOne({ name: name });
     if (existingBrand) {
       return res.status(400).json({ error: "Brand name already exists" });
     }

    const brandLogo = new BrandLogo({
      name: name,
      image: image,
      relatedCharacters: relatedCharacters,
      level: level,
      hint: hint,
      bomb: bomb,
      right: right,
    });
    const savedLogo = await brandLogo.save();
    res.json(savedLogo);
  } catch (error) {
    console.error("Failed to save brand logo:", error);
    res.status(500).json({ error: "Failed to save brand logo" });
  }
};

// GET /logos
exports.getAllLogos = async (req, res) => {
  try {
    //  Verify the token
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    // Verify and decode the token
    const decodedToken = jwt.verify(token, "secretKey");
    console.log("token " + decodedToken);
    // Access the user ID from the decoded token
    const userId = decodedToken.userId;

    // Proceed with retrieving the brand logos
    const logos = await BrandLogo.find();
    res.json(logos);
  } catch (error) {
    console.error("Failed to retrieve brand logos:", error);
    res.status(500).json({ error: "Failed to retrieve brand logos,", error });
  }
};

// GET /logos/:level
exports.getLogosByLevel = async (req, res) => {
  try {
    console.log("*******");
    // Verify the token
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify and decode the token
    const decodedToken = jwt.verify(token, "secretKey");

    // Access the user ID from the decoded token
    const userId = decodedToken.userId;

    // Perform further authentication/authorization checks if required
    // For example, check if the user exists or has sufficient privileges

    // Retrieve the level parameter from the request
    const level = req.params.level;
    console.log(level);

    // Retrieve the brand logos for the specified level only if the authentication/authorization checks pass
    const logos = await BrandLogo.find({ level: level });
    console.log(logos);
    res.json(logos);
  } catch (error) {
    console.error("Failed to retrieve brand logos by level:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve brand logos by level", error });
  }
};
