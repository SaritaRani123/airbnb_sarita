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
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const { body, validationResult } = require("express-validator");
const exphbs = require("express-handlebars");
const config = require("./config/database");
const Listing = require("./models/Listing");

const app = express();
// const port = process.env.PORT || config.port || 3000;
const port = process.env.PORT || 3000;

// ---------------- HANDLEBARS SETUP ----------------
const hbs = exphbs.create({
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    get: (obj, key) => obj[key],
    nameOrNA: (name) =>
      (!name || name.trim() === '') ? '<span style="color:red; font-weight:bold;">N/A</span>' : name,
    isEmptyName: (name, options) =>
      (!name || name.trim() === '') ? options.fn(this) : options.inverse(this)
  }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// ---------------- MIDDLEWARE ----------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/listings', require('./routes/listings'));


// ---------------- MONGODB CONNECTION ----------------
mongoose.connect(config.url)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Connection error:", err));

const db = mongoose.connection;
db.on("connected", () => console.log("Mongoose connected"));
db.on("error", err => console.error("Mongoose error:", err));
db.on("disconnected", () => console.log("Mongoose disconnected"));

process.on("SIGINT", async () => {
  await db.close();
  console.log("Mongoose disconnected on app termination");
  process.exit(0);
});

// ---------------- ROUTES ----------------

// Home page
app.get('/', (req, res) => {
  res.render('index', { title: 'Airbnb Dashboard' });
});

// All Data (limited to 100 for performance)
app.get('/allData', async (req, res, next) => {
  try {
    const data = await Listing.find().limit(100).lean();
    res.render('allData', { title: 'All Airbnb Properties', data });
  } catch (err) {
    next(err);
  }
});


// View Data in table limited to 100 for performance
app.get('/viewData', async (req, res, next) => {
  try {
    const data = await Listing.find().limit(100).lean(); // fetch all listings
    res.render('viewData', { title: 'All Airbnb Listings', data });
  } catch (err) {
    next(err);
  }
});

// Single Property by _id
app.get('/allData/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.render('error', { title: 'Error', message: 'Invalid Property ID' });
    }

    const listing = await Listing.findById(id).lean();
    if (!listing) return res.render('error', { title: 'Error', message: 'Property not found' });

    res.render('propertyDetails', { title: 'Property Details', data: listing });
  } catch (err) { next(err); }
});

// Display Search By Name Form
app.get('/searchName', (req, res) => {
  res.render('searchName', { title: 'Search Property by Name' });
});


// Search by Name
app.post('/searchName',
  body('property_name').notEmpty().withMessage('Property Name is required').trim().escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.render('searchName', { errors: errors.array(), title: 'Search Property by Name' });

    try {
      const searchName = req.body.property_name;
      const matched = await Listing.find({ NAME: new RegExp(searchName, 'i') }).lean();
      if (!matched.length)
        return res.render('error', { title: 'No Results', message: 'No properties found' });

      res.render('searchResults', { title: `Properties matching "${searchName}"`, data: matched });
    } catch (err) { next(err); }
  }
);


// Display Search By ID Form
app.get('/searchProperty', (req, res) => {
  res.render('searchProperty', { title: 'Search Property by ID' });
});

// Search by property ID (string)
app.post('/searchProperty',
  body('property_id').notEmpty().withMessage('Property ID is required').trim(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('searchProperty', { errors: errors.array(), title: 'Search Property by ID' });
      }

      let id = req.body.property_id.trim(); // remove whitespace
      console.log("Searching for property id:", id); // DEBUG

      const property = await Listing.findOne({ id: id }).lean();

      if (!property) {
        console.log("Property not found!"); // DEBUG
        return res.render('error', { title: 'Error', message: `Property with ID ${id} not found` });
      }

      console.log("Found property:", property); // DEBUG
      res.render('searchResults', { title: `Property ID ${id} Details`, data: [property] });

    } catch (err) {
      next(err);
    }
  }
);




// Display Add Property form
app.get('/add', (req, res) => {
  res.render('addProperty', { title: 'Add New Property', data: {} });
});

// Insert new property
app.post('/add',
  [
    body('id').notEmpty().withMessage('Property ID is required'),
    body('NAME').notEmpty().withMessage('Name is required'),
    body('price').notEmpty().isNumeric().withMessage('Price must be numeric')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('addProperty', { 
        errors: errors.array(), 
        title: 'Add New Property', 
        data: req.body 
      });
    }

    try {
      // Convert price to float
      req.body.price = parseFloat(req.body.price);

      // Save new listing
      await Listing.create(req.body);

      res.redirect('/allData');
    } catch (err) {
      next(err);
    }
});



// -------------------- GET UPDATE FORM --------------------
// Display simple update form 
app.get('/updateProperty', (req, res) => {
  res.render('updateProperty', {
    title: 'Update Property',
    data: {} // empty initially
  });
});


// -------------------- POST UPDATE --------------------
app.post('/updateProperty', async (req, res, next) => {
  try {
    const { id, NAME, price } = req.body;

    const updated = await Listing.findOneAndUpdate(
      { id: parseInt(id) },
      { NAME, price: parseFloat(price) },
      { new: true }
    );

    if (!updated) {
      return res.render("updateProperty", {
        title: "Update Property",
        data: { id, NAME, price },
        errors: [{ msg: "Property not found in dataset" }]
      });
    }

    res.render("updateProperty", {
      title: "Update Property",
      data: updated,
      success: "Property updated successfully!"
    });

  } catch (err) {
    console.error("Update error:", err);
    next(err);
  }
});



// -------------------- DELETE FORM (GET) --------------------
app.get('/deleteProperty', (req, res) => {
  res.render('deleteProperty', { title: "Delete Property" });
});

// -------------------- DELETE PROPERTY POST --------------------
app.post('/deleteProperty',
  body('property_id').notEmpty().withMessage('Property ID is required'),
  async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('deleteProperty', {
        title: "Delete Property",
        errors: errors.array()
      });
    }

    let propertyId = req.body.property_id.trim();

    try {
      const result = await Listing.deleteOne({ id: propertyId });

      if (result.deletedCount === 0) {
        return res.render('deleteProperty', {
          title: "Delete Property",
          message: "No property found with that ID"
        });
      }

      return res.render('deleteProperty', {
        title: "Delete Property",
        message: "Property deleted successfully!"
      });

    } catch (err) {
      next(err);
    }
  }
);

// // Display filter form
// app.get('/priceFilter', (req, res) => {
//   res.render('priceFilter', { title: 'Filter Airbnb by Price Range' });
// });


// // Filter properties by price range
// app.post('/priceFilter',
//   body('minPrice').notEmpty().withMessage('Minimum Price is required').isFloat({ min: 0 }),
//   body('maxPrice').notEmpty().withMessage('Maximum Price is required').isFloat({ min: 0 }),
//   async (req, res, next) => {

//     const errors = validationResult(req);
//     const minPrice = parseFloat(req.body.minPrice);
//     const maxPrice = parseFloat(req.body.maxPrice);

//     if (!errors.isEmpty()) {
//       return res.render('viewData', {
//         title: 'Filtered Airbnb Listings',
//         errors: errors.array(),
//         data: [],
//         minPrice,
//         maxPrice
//       });
//     }

//     if (minPrice > maxPrice) {
//       return res.render('viewData', {
//         title: 'Filtered Airbnb Listings',
//         errors: [{ msg: 'Minimum Price cannot be greater than Maximum Price' }],
//         data: [],
//         minPrice,
//         maxPrice
//       });
//     }

//     try {

//       const filtered = await Listing.aggregate([
//         {
//           // unify price field so we catch "price" or "Price"
//           $addFields: {
//             priceValue: {
//               $ifNull: ["$price", "$Price"]  // handles both
//             }
//           }
//         },
//         {
//           $addFields: {
//             priceNum: {
//               $convert: {
//                 input: "$priceValue",
//                 to: "double",
//                 onError: null,
//                 onNull: null
//               }
//             }
//           }
//         },
//         {
//           $match: {
//             priceNum: { $gte: minPrice, $lte: maxPrice }
//           }
//         },
//         {
//           $project: {
//             price: "$priceNum",
//             NAME: 1,
//             neighbourhood: 1,
//             host_name: 1,
//             id: 1
//           }
//         }
//       ]);

//       res.render('viewData', {
//         title: `Properties between $${minPrice} and $${maxPrice}`,
//         data: filtered,
//         minPrice,
//         maxPrice
//       });

//     } catch (err) {
//       next(err);
//     }
//   }
// );




// ---------------- GLOBAL ERROR HANDLING ----------------
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === "ValidationError")
    return res.status(400).json({ message: "Validation Error", errors: err.errors });
  res.status(500).json({ message: "Internal Server Error" });
});

// Catch-all for wrong routes
app.use((req, res) => res.render('error', { title: 'Error', message: 'Wrong Route' }));

// ---------------- START SERVER ----------------
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

// app.listen(port, () => console.log(`Server running on port ${port}`));
