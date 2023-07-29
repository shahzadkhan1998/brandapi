const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/usermodel.js");
const nodemailer = require('nodemailer');
const crypto = require('crypto');


// Get the Gmail ID and password from environment variables
const gmailId = process.env.GMAIL_ID;
const gmailPassword = process.env.GMAIL_PASSWORD;
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
    res.json({ token, userId: user._id,level });
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

    // Check if the user has sufficient privileges to update the level
    // Perform any required authorization checks based on your application's logic
    // For example, check if the user is an administrator or if the user is updating their own level

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
async function sendResetPasswordEmail(email, resetToken) {
  const transporter = nodemailer.createTransport({
    debug: true,
    service: 'Gmail',
    auth: {
      user: 'sk266349@gmail.com',
      pass: 'pcwxpqengqrvrmoe'
    },
  });
  // Listen for 'log' event
transporter.on('log', (log) => {
  console.log(log.message);
});

// Listen for 'error' event
transporter.on('error', (error) => {
  console.error('Error occurred while sending email:', error);
});

  const resetLink = `https://dull-pink-bluefish-coat.cyclic.app/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: gmailId,
    to: email,
    subject: 'Reset Your Password',
    html: `<p>Hello,</p><p>You have requested to reset your password. Click the link below to reset it:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
  };

  await transporter.sendMail(mailOptions);
}

// Forgot password function
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "Email not found." });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendResetPasswordEmail(email, resetToken);

    res.json({ message: "Reset password email sent." });
  } catch (error) {
    console.error("Failed to process forgot password request:", error);
    res.status(500).json({ error: "Failed to process forgot password request." });
  }
};


// Reset password function
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    const user = await User.findOne({
      resetToken,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();
    delete validResetTokens[resetToken];
    res.json({ message: "Password reset successful." });
  } catch (error) {
    console.error("Failed to reset password:", error);
    res.status(500).json({ error: "Failed to reset password." });
  }
};

// In a real application, you would store reset tokens and their expiration times in a database.
const validResetTokens = {};

// GET route for rendering the password reset page with the form
exports.resetPassword('/reset-password', (req, res) => {
  const resetToken = req.query.token;
  if (!resetToken || !validResetTokens[resetToken]) {
    // If the reset token is missing or not valid, you can redirect to an error page.
    // Alternatively, you can render an error message on this page itself.
    return res.send('Invalid or expired reset token. Please request a new password reset link.');
  }

  // Render the password reset page with the form where the user can enter their new password.
  res.send(`
    <html>
      <body>
        <form method="POST" action="/reset-password">
          <input type="hidden" name="token" value="${resetToken}">
          <label for="newPassword">New Password:</label>
          <input type="password" name="newPassword" required>
          <button type="submit">Reset Password</button>
        </form>
      </body>
    </html>
  `);
});









