const mongoose = require("mongoose");

const truckBookingSchema = new mongoose.Schema({
  truckId: { type: mongoose.Schema.Types.ObjectId, ref: "Truck", required: true },
  customerName: String,
  email: String,
  phone: String,
  pickupLocation: String,
  dropoffLocation: String,
  pickupDate: Date,
  pickupTime: String,
  dropoffDate: Date,
  estimatedDropoffTime: String,
  bookingDate: Date,
  estimatedDeliveryDate: Date,
  estimatedDeliveryTime: String
});

module.exports = mongoose.model("truckBooking", truckBookingSchema);
