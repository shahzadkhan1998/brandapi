const productModel = require("../model/productmodel.js");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const fs = require("fs");


exports.createProduct = async (req, res) => {
    try {
        const { name, image, countryName, countryFlag, description, type, status } = req.body;
        console.log(image);
        const existingproduct = await productModel.findOne({ name: name });
        if (existingproduct) {
            return res.status(400).json({ error: "Brand name already exists" });
        }

        const brandLogo = new productModel({
            name: name,
            image: image,
            status: status,
            countryName: countryName,
            countryFlag: countryFlag,
            description: description,
            type: type,
        });

        const savedLogo = await brandLogo.save();
        res.json(savedLogo);
    } catch (error) {
        console.error("Failed to save Product :  ", error);
        res.status(500).json({ error: "Failed to save product " });
    }

}

exports.getProduct = async (req, res) => {
    try {
        const allProducts = await productModel.find();

        if (allProducts.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }
        res.json(allProducts);
    } catch (error) {
        console.error("Failed to retrieve product: ", error);
        res.status(500).json({ error: "Failed to retrieve product" });

    }

}
