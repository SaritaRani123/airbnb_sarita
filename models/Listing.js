/*********************************************************************************
 * ITE5315 – Assignment 4
 * I declare that this assignment is my own work in accordance with Humber Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * Name: Sarita Rani   Student ID: N01696421   Date: 20-11-205
 *
 ********************************************************************************/

const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  id: { type: String },
  NAME: { type: String, required: true },
  host_id: String,
  host_name: String,
  neighbourhood_group: String,
  neighbourhood: String,
  lat: Number,
  long: Number,
  country: String,
  country_code: String,
  instant_bookable: String,
  cancellation_policy: String,
  room_type: String,
  construction_year: Number,
  // price: Number,
   price: { type: mongoose.Schema.Types.Mixed, required: true }, // allow number or string     
  service_fee: Number,
  minimum_nights: Number,
  number_of_reviews: Number,
  last_review: String,
  reviews_per_month: Number,
  review_rate_number: Number,
  calculated_host_listings_count: Number,
  availability_365: Number,
  house_rules: String,
  license: String,
  property_type: String,
  thumbnail: String,
  images: [String]
}, { timestamps: true, collection: 'airbnb'  });

module.exports = mongoose.model('Listing', ListingSchema);
