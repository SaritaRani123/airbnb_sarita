/*********************************************************************************
 * ITE5315 – Assignment 4
 * I declare that this assignment is my own work in accordance with Humber Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * Name: Sarita Rani   Student ID: N01696421   Date: 20-11-205
 *
 ********************************************************************************/

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs').promises;
const Listing = require('./models/Listing');
const config = require('./config/database');

function normalize(item) {
  return {
    id: item["id"],
    NAME: item["NAME"],
    host_id: item["host id"],
    host_name: item["host name"],
    host_identity_verified: item["host_identity_verified"],
    neighbourhood_group: item["neighbourhood group"],
    neighbourhood: item["neighbourhood"],
    lat: Number(item["lat"]),
    long: Number(item["long"]),
    country: item["country"],
    country_code: item["country code"],
    instant_bookable: item["instant_bookable"],
    cancellation_policy: item["cancellation_policy"],
    room_type: item["room type"],
    construction_year: Number(item["Construction year"]),
    price: item["price"].trim(),
    service_fee: item["service fee"].trim(),
    minimum_nights: Number(item["minimum nights"]),
    number_of_reviews: Number(item["number of reviews"]),
    last_review: item["last review"],
    reviews_per_month: Number(item["reviews per month"]),
    review_rate_number: Number(item["review rate number"]),
    calculated_host_listings_count: Number(item["calculated host listings count"]),
    availability_365: Number(item["availability 365"]),
    house_rules: item["house_rules"],
    license: item["license"],
    property_type: item["property_type"],
    thumbnail: item["thumbnail"],
    images: item["images"]
  };
}

mongoose.connect(config.url).then(async () => {
  console.log('MongoDB connected');

  const raw = JSON.parse(await fs.readFile('airbnb_with_photos.json', 'utf8'));

  // Normalize each item → match schema
  const normalizedData = raw.map(normalize);

  for (let item of normalizedData) {
    await Listing.updateOne({ id: item.id }, item, { upsert: true });
  }

  console.log('Data seeded successfully ✔');
  mongoose.disconnect();
});
