const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction');

// Create Auction
router.post('/', async (req, res) => {
  try {
    const { title, description, startingBid, endDate } = req.body;
    const newAuction = new Auction({ title, description, startingBid, currentBid: startingBid, endDate }); // Initialize currentBid with startingBid
    await newAuction.save();
    res.status(201).json(newAuction);
  } catch (error) {
    res.status(500).json({ message: 'Creating auction failed' });
  }
});

// Get All Auctions
router.get('/', async (req, res) => {
  try {
    const auctions = await Auction.find();
    res.status(200).json(auctions);
  } catch (error) {
    res.status(500).json({ message: 'Fetching auctions failed' });
  }
});

// Get Auction by ID
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (auction) {
      res.status(200).json(auction);
    } else {
      res.status(404).json({ message: 'Auction not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Fetching auction failed' });
  }
});

// Update Auction
router.put('/:id', async (req, res) => {
  try {
    const { title, description, startingBid, currentBid, endDate } = req.body;
    const auction = await Auction.findByIdAndUpdate(req.params.id, { title, description, startingBid, currentBid, endDate }, { new: true });
    if (auction) {
      res.status(200).json(auction);
    } else {
      res.status(404).json({ message: 'Auction not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Updating auction failed' });
  }
});

// Delete Auction
router.delete('/:id', async (req, res) => {
  try {
    const auction = await Auction.findByIdAndDelete(req.params.id);
    if (auction) {
      res.status(200).json({ message: 'Auction deleted' });
    } else {
      res.status(404).json({ message: 'Auction not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Deleting auction failed' });
  }
});

module.exports = router;
