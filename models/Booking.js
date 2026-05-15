const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^\S+@\S+\.\S+$/.test(v),
      message: 'Invalid email format'
    }
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^[0-9]{10}$/.test(v),
      message: 'Phone number must be 10 digits'
    }
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true,
    enum: ['Mandi Gobindgarh', 'Patiala', 'Ludhiana']
  },
  weight: {
    type: Number,
    required: true,
    min: [1, 'Weight must be at least 1tonn']
  },
  Senderaddress:{
    type:String,
    required:true,
  },
  Receiveraddress: {
    type: String,
    required: true
  },
  bDate: {
    type: Date,
    required: true
  },
  dDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value >= this.bDate;
      },
      message: 'Delivery date cannot be before booking date'
    }
  },
  dTime: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
      message: 'Invalid time format. Use HH:MM (24-hour format)'
    }
  },
  price: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
