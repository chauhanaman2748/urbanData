const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://spyman2748:aman2748@cluster0.4zc4a.mongodb.net/UHData?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(() => {
  console.log("Connected to UHData database");
}).catch(err => {
  console.error("Error connecting to the database:", err.message);
});

app.use(express.static(path.join(__dirname, '../my-uh-management/build')));

// Define a Schema and Model
const bookingSchema = new mongoose.Schema({
  date: Date,
  status: String,
  details: {
    Name: String,
    Flat: String,
    AmountPaid: Boolean
  }
});

const Booking = mongoose.model('Booking', bookingSchema);

// API endpoint to fetch all bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add booking
app.post('/api/bookings/add', async (req, res) => {
  try {
    const { date, status, details } = req.body;

    // Create a new booking in MongoDB
    const newBooking = new Booking({
      date: new Date(date),
      status,
      details, // Spread the details object directly into the booking object
    });

    await newBooking.save(); // Save the new booking to the database

    res.status(201).send("Booking added successfully");
  } catch (error) {
    console.error("Error adding booking:", error);
    res.status(500).send("Error adding booking");
  }
});

// Cancel booking
app.post('/api/cancel', async (req, res) => {
  try {
    const { date } = req.body;
    console.log(req.body);

    // Remove the booking for the specified date
    await Booking.deleteOne({ date: new Date(date) });

    res.status(200).send("Booking canceled successfully");
  } catch (error) {
    console.error("Error canceling booking:", error);
    res.status(500).send("Error canceling booking");
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/../frontend/build/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
