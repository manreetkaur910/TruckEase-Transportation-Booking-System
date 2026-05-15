const mongoose = require("mongoose");

const truckSchema = new mongoose.Schema({
  name: String,
  licensePlate: String,
  estimatedWeight: String
});

module.exports = mongoose.model("Truck", truckSchema);
