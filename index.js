const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const brandLogoRoutes = require('./routes/brandroute.js');
const userRoutes = require('./routes/userroute.js');


// Set up Express app
const app = express();
// Middleware
app.use(bodyParser.json());

// Routes
app.use('/logos', brandLogoRoutes);
// Routes
app.use('/users', userRoutes);

const  uri = "mongodb+srv://shahzad:root@cluster0.7mmojmt.mongodb.net/?retryWrites=true&w=majority";

// Connect to MongoDB
mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.error('Failed to connect to MongoDB:', error);
  });


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

