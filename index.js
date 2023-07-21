require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const brandLogoRoutes = require('./routes/brandroute.js');
const userRoutes = require('./routes/userroute.js');
const cors = require('cors');


// Set up Express app
const app = express();
// CORS is enabled for all origins
app.use(cors());
// Middleware
app.use(bodyParser.json());

// Routes
app.use('/logos', brandLogoRoutes);
// Routes
app.use('/users', userRoutes);

//const  uri = "mongodb+srv://shahzad:root@cluster0.7mmojmt.mongodb.net/?retryWrites=true&w=majority";
const uri = "mongodb://shahzad:root@ac-f4w1kqp-shard-00-00.7mmojmt.mongodb.net:27017,ac-f4w1kqp-shard-00-01.7mmojmt.mongodb.net:27017,ac-f4w1kqp-shard-00-02.7mmojmt.mongodb.net:27017/?ssl=true&replicaSet=atlas-ocdiz1-shard-0&authSource=admin&retryWrites=true&w=majority";
// Connect to MongoDB
mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.error('Failed to connect to MongoDB:', error);
  });

 const ipAddress = '************';
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on http://${ipAddress}:${port}/`);
});


