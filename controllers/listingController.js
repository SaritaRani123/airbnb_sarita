/*********************************************************************************
 * ITE5315 – Assignment 4
 * I declare that this assignment is my own work in accordance with Humber Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * Name: Sarita Rani   Student ID: N01696421   Date: 20-11-205
 *
 ********************************************************************************/

const Listing = require("../models/Listing");

// GET ALL listings

// exports.getAll = async (req, res, next) => {
//   try {
//     const listings = await Listing.find().lean();
//     res.status(200).json({ count: listings.length, data: listings });
//   } catch (err) { next(err); }
// };

exports.getAll = async (req, res, next) => {
  try {
    const listings = await Listing.find().limit(20).lean(); // limit to 20
    res.status(200).json({ count: listings.length, data: listings });
  } catch (err) { next(err); }
};

// GET ONE listing by _id
exports.getOne = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).lean();
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json(listing);
  } catch (err) { next(err); }
};

// CREATE listing
exports.create = async (req, res, next) => {
  try {
    req.body.price = parseFloat(req.body.price);
    const listing = await Listing.create(req.body);
    res.status(201).json(listing);
  } catch (err) { next(err); }
};

// UPDATE listing
exports.update = async (req, res, next) => {
  try {
    req.body.price = parseFloat(req.body.price);
    const listing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json(listing);
  } catch (err) { next(err); }
};

// DELETE listing
exports.remove = async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.status(204).send();
  } catch (err) { next(err); }
};
