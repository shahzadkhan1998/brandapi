const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/usermodel.js");
const nodemailer = require("nodemailer");
const crypto = require("crypto");


// User Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email: req.body.email });
    console.log(req.body);
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Failed to register user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
};

// User Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Email not Found." });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Password not Matached. " });
    }
    const token = jwt.sign({ userId: user._id }, "secretKey");
    console.log(req.body);

    const level = user.level;
    console.log(level);
    res.json({ token, userId: user._id, level });
  } catch (error) {
    console.error("Failed to authenticate user:", error);
    res.status(500).json({ error: "Failed to authenticate user" });
  }
};

// Update User Level
exports.updateLevel = async (req, res) => {
  try {
    // Verify the token
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify and decode the token
    const decodedToken = jwt.verify(token, "secretKey");

    // Access the user ID from the decoded token
    const userId = decodedToken.userId;


    // Extract the level from the request body
    const { level } = req.body;

    // Update the user's level in the database
    await User.findByIdAndUpdate(userId, { level });

    res.json({ message: "User level updated successfully" });
  } catch (error) {
    console.error("Failed to update user level:", error);
    res.status(500).json({ error: "Failed to update user level" });
  }
};

// Add Coins to User
exports.addCoins = async (req, res) => {
  try {
    // Verify the token
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify and decode the token
    const decodedToken = jwt.verify(token, "secretKey");

    // Access the user ID from the decoded token
    const userId = decodedToken.userId;

    // Access the coins from the request body

    const coins = Number(req.body.coins);
    if (isNaN(coins)) {
      return res.status(400).json({ error: "Invalid coins value" });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add the coins to the user's existing coins
    user.coins += coins;

    // Save the updated user data
    await user.save();

    res.json({ message: "Coins added successfully" });
  } catch (error) {
    console.error("Failed to add coins:", error);
    res.status(500).json({ error: "Failed to add coins" });
  }
};

// Remove Coins from User
exports.removeCoins = async (req, res) => {
  try {
    const { userId, coins } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.coins < coins) {
      return res.status(400).json({ error: "Insufficient coins" });
    }
    user.coins -= coins;
    await user.save();
    res.json({ message: "Coins removed successfully" });
  } catch (error) {
    console.error("Failed to remove coins:", error);
    res.status(500).json({ error: "Failed to remove coins" });
  }
};

// Helper function to send the reset password email
async function sendResetPasswordEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    debug: true,
    service: "Gmail",
    auth: {
      user: "sk266349@gmail.com",
      pass: "pcwxpqengqrvrmoe",
    },
  });

  // Listen for 'log' event
  transporter.on("log", (log) => {
    console.log(log.message);
  });

  // Listen for 'error' event
  transporter.on("error", (error) => {
    console.error("Error occurred while sending email:", error);
  });

  const mailOptions = {
    from: "sk266349@gmail.com", // Update with the sender's email address
    to: email,
    subject: "Reset Your Password",
    html: `<p>Hello,</p><p>You have requested to reset your password. Your One-Time Password (OTP) is:</p><p><strong>${otp}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
};

// OTP expiration time (in milliseconds)
const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

// Map to store valid OTPs and their expiration times
const validOTPs = new Map();

// Forgot password function
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "Email not found." });
    }

    // Generate a random OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save the OTP and its expiration time
    const otpExpiry = Date.now() + OTP_EXPIRY_TIME;
    validOTPs.set(email, { otp, otpExpiry });

    // Send the OTP to the user's email
    await sendResetPasswordEmail(email, otp);

    res.json({ message: "Reset password OTP sent.", otp: otp });
  } catch (error) {
    console.error("Failed to process forgot password request:", error);
    res
      .status(500)
      .json({ error: "Failed to process forgot password request." });
  }
};

// Reset password function
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Check if the OTP is valid and not expired
    const storedOTP = validOTPs.get(email);

    if (
      !storedOTP ||
      storedOTP.otp !== otp ||
      storedOTP.otpExpiry < Date.now()
    ) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Reset the user's password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Delete the used OTP from the map
    validOTPs.delete(email);

    res.json({ message: "Password reset successful." });
  } catch (error) {
    console.error("Failed to reset password:", error);
    res.status(500).json({ error: "Failed to reset password." });
  }
};
