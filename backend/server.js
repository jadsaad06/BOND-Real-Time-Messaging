require('dotenv').config({ path: '../.env' });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;
const uri = process.env.DB_KEY;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB (Persistent)
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB connection error:", err));

// Test Route
app.get('/', (req, res) => {
  res.send('Server is running...');
});

// Placeholder for authentication routes
app.use('/auth', require('./routes/authRoutes'));

// Placeholder for messaging routes
app.use('/messages', require('./routes/messageRoutes'));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});
