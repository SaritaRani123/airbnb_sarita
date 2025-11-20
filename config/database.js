/*********************************************************************************
 * ITE5315 – Assignment 4
 * I declare that this assignment is my own work in accordance with Humber Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * Name: Sarita Rani   Student ID: N01696421   Date: 20-11-205
 *
 ********************************************************************************/

require("dotenv").config();

module.exports = {
  // url: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/airbnbDB',
  url: process.env.MONGO_URI,
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || "development"
};

