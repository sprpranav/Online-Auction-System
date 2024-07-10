// controllers/auctionController.js
const Auction = require('../models/Auction');

// Create a new auction
exports.createAuction = async (req, res) => {
  const { title, description, startingBid, endDate } = req.body;

  try {
    const newAuction = new Auction({
      title,
      description,
      currentBid: startingBid,
      startingBid,
      endDate,
      creator: req.user.id, // assuming you have user ID from authentication
    });

    const auction = await newAuction.save();
    res.status(201).json(auction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all auctions
exports.getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find();
    res.json(auctions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get auction by ID
exports.getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ msg: 'Auction not found' });
    }

    res.json(auction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update an auction
exports.updateAuction = async (req, res) => {
  const { title, description, currentBid, endDate } = req.body;

  try {
    let auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ msg: 'Auction not found' });
    }

    // Check if the user is the creator or admin (assuming admin has additional rights)
    if (auction.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    auction = await Auction.findByIdAndUpdate(
      req.params.id,
      { $set: { title, description, currentBid, endDate } },
      { new: true }
    );

    res.json(auction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Bid on an auction
exports.bidAuction = async (req, res) => {
  const { bidAmount } = req.body;

  try {
    let auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ msg: 'Auction not found' });
    }

    // Non-creators can bid on auctions
    if (auction.creator.toString() === req.user.id) {
      return res.status(403).json({ msg: 'The auction creator cannot bid on their own auction' });
    }

    auction.currentBid = bidAmount;

    await auction.save();
    res.json(auction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete an auction
exports.deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ msg: 'Auction not found' });
    }

    // Check if the user is the creator or admin (assuming admin has additional rights)
    if (auction.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await auction.remove();
    res.json({ msg: 'Auction removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
