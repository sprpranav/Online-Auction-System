// server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
const User = mongoose.model('User', userSchema);

// Auction Schema
const auctionSchema = new mongoose.Schema({
  title: String,
  description: String,
  currentBid: Number,
  endDate: Date,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imageUrl: String,
});
const Auction = mongoose.model('Auction', auctionSchema);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Register Route
app.post('/api/users/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login Route
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Create Auction Route
app.post('/api/auctions', upload.single('image'), async (req, res) => {
  const { title, description, startingBid, endDate, creatorId } = req.body;
  const imageUrl = req.file ? req.file.path : null;
  try {
    const auction = new Auction({ title, description, currentBid: startingBid, endDate, creator: creatorId, imageUrl });
    await auction.save();
    res.status(201).json({ message: 'Auction created successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Creating auction failed' });
  }
});

// Get All Auctions Route
app.get('/api/auctions', async (req, res) => {
  try {
    const auctions = await Auction.find().populate('creator');
    res.status(200).json(auctions);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Fetching auctions failed' });
  }
});

// Get Single Auction Route
app.get('/api/auctions/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).populate('creator');
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    res.status(200).json(auction);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Fetching auction details failed' });
  }
});

// Place Bid Route
app.put('/api/auctions/bid/:id', async (req, res) => {
  const { currentBid } = req.body;
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    auction.currentBid = currentBid;
    await auction.save();
    res.status(200).json({ message: 'Bid placed successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Placing bid failed' });
  }
});

// Update Auction Route
app.put('/api/auctions/:id', upload.single('image'), async (req, res) => {
  const { title, description, startingBid, currentBid, endDate, creatorId } = req.body;
  const imageUrl = req.file ? req.file.path : null;
  try {
    const auction = await Auction.findByIdAndUpdate(req.params.id, { title, description, currentBid, endDate, creator: creatorId, imageUrl }, { new: true });
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    res.status(200).json({ message: 'Auction updated successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Updating auction failed' });
  }
});

// Delete Auction Route
app.delete('/api/auctions/:id', async (req, res) => {
  try {
    const auction = await Auction.findByIdAndDelete(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    res.status(200).json({ message: 'Auction deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Deleting auction failed' });
  }
});

// Serve images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
