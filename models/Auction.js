// models/Auction.js
const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  title: String,
  description: String,
  currentBid: Number,
  endDate: Date,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imageUrl: String,
});

const Auction = mongoose.model('Auction', auctionSchema);
module.exports = Auction;
