 const express = require('express');
 const mongoose = require('mongoose');
 const nodemailer = require('nodemailer') ;
 const Booking = require('./models/Booking');
 const bcrypt = require("bcrypt");
 const Admin = require("./models/Admin");
 const session = require("express-session");
 const bodyParser=require('body-parser')
 const User = require('./models/UserLogin');
  const ensureAuthenticated = require('./Project- Transportation main/middleware/auth'); 
require('dotenv').config();
const methodOverride = require("method-override");

 const path = require('path');
 const multer = require('multer');
 const upload = multer(); 

 const app = express();
 const PORT = 3000;

const Truck = require("./models/Truck");
const TruckBooking = require("./models/truckBooking");

// // Middleware
app.use(methodOverride("_method"));

 app.use(express.urlencoded({ extended: true }));
 app.use(express.json());

app.use(session({ secret: "12345anand", resave: false, saveUninitialized: false }));

 app.use(express.static('public')); // Optional: if you serve static assets



// // Connect to MongoDB
 mongoose.connect(process.env.MONGO_URI)
   .then(() => console.log('MongoDB connected'))
   .catch(err => console.log('MongoDB connection error:', err));

 app.use(express.static(path.join(__dirname, 'Project- Transportation main', 'public')));
 app.set('views', path.join(__dirname, 'Project- Transportation main', 'views'));
 app.set('view engine', 'ejs')
 // Routes
 app.get('/', (req, res) => res.render('index', { currentPage: 'home' }));
 app.get('/aboutUs', (req, res) => res.render('aboutUs', { currentPage: 'aboutUs' }));
 // app.get('/bookings', (req, res) => res.render('bookings', { currentPage: 'bookings' }));
 app.get('/bookings', ensureAuthenticated, (req, res) => {
   res.render('bookings', { currentPage: 'bookings', user: req.session.user });
 });
 app.get('/fleetTypes', (req, res) => res.render('fleetTypes', { currentPage: 'fleetTypes' }));
 app.get('/solutions', (req, res) => res.render('solutions', { currentPage: 'solutions' }));
 app.get('/careers', (req, res) => res.render('careers', { currentPage: 'careers' }));
 app.get('/contactUs', (req, res) => res.render('contactUs', { currentPage: 'contactUs' }));
 app.get('/privacy', (req, res) => res.render('privacy', { currentPage: 'privacy' }));
 app.get('/Faqs', (req, res) => res.render('Faqs', { currentPage: 'Faqs' }));

// Routes

// show bookings + edit form
app.get("/admin/trucks_dashboard", async (req, res) => {
  const trucks = await Truck.find();
  let truckBookings = [];
  let selectedTruck = null;
  let editTruck = null;

  if (req.query.truck) {
    selectedTruck = await Truck.findById(req.query.truck);
    truckBookings = await TruckBooking.find({ truckId: selectedTruck._id });
  }

  if (req.query.editTruckId) {
    editTruck = await Truck.findById(req.query.editTruckId);
  }

  res.render("trucks_dashboard", { trucks, truckBookings, selectedTruck, editTruck });
});

// Add truck
app.post("/trucks", async (req, res) => {
  const newTruck = await new Truck(req.body).save();
  res.redirect("/admin/trucks_dashboard/?truck=" + newTruck._id);
});


// update truck or edit truck
app.put("/trucks/:id", async (req, res) => {
  await Truck.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    licensePlate: req.body.licensePlate,
    estimatedWeight: req.body.estimatedWeight
  });
  res.redirect("/admin/trucks_dashboard/?truck=" + req.params.id);
});

// Delete truck
app.delete("/trucks/:id", async (req, res) => {
  await Truck.findByIdAndDelete(req.params.id);
  await TruckBooking.deleteMany({ truckId: req.params.id });
  res.redirect("/admin/trucks_dashboard");
});

// Create booking
app.post("/admin/trucks_dashboard", async (req, res) => {
  await new TruckBooking(req.body).save();
  res.redirect(`/admin/trucks_dashboard/?truck=${req.body.truckId}`);
});

// add form
app.get('/truckbookings/new', (req, res) => {
  const truckId = req.query.truck;
  res.render('editBooking', { truckBooking: null, truckId });
});

// edit booking form
app.get("/truckbookings/:id/edit", async (req, res) => {
  const truckBooking = await TruckBooking.findById(req.params.id);
  res.render("editBooking", { truckBooking, truckId: null });
});

// Update Booking
app.put("/:id", async (req, res) => {
  await TruckBooking.findByIdAndUpdate(req.params.id, req.body);
  res.redirect(`/admin/trucks_dashboard/?truck=${req.body.truckId}`);
});

// Delete Booking
app.delete("/:id", async (req, res) => {
  const booking = await TruckBooking.findById(req.params.id);
  if (booking) {
    await booking.deleteOne();
    res.redirect(`/admin/trucks_dashboard/?truck=${booking.truckId}`);
  } else {
    res.redirect("/admin/trucks_dashboard");
  }
});

app.get('/admin/trucks_dashboard', (req,res) => {
  res.render('trucks_dashboard', {currentPage: 'trucks_dashboard'});
});
app.get('/truckbookings/new', (req,res) => {
  res.render('editBooking', {currentPage: 'editBooking'});
});


 // app.js or routes file
 app.get('/login', (req, res) => {
   res.render('User/Login2'); // Renders login.ejs
 });
app.get('/signup', (req, res) => {
   res.render('User/Signup2'); // Renders signup.ejs
 });
 // Home Route (Redirect to Admin Login)
 app.get("/admin", (req, res) => {
     res.redirect("/admin/Login");
 });

// // Admin Signup
 app.get("/admin/signup", (req, res) => {
     res.render("admin/Signup");
 });

 app.post("/admin/signup", async (req, res) => {
     const { name, email, password } = req.body;
     const existingAdmin = await Admin.findOne({ email });

     if (existingAdmin) {
         return res.send("Admin already registered.");
     }

     const hashedPassword = await bcrypt.hash(password, 10);
     const newAdmin = new Admin({ name, email, password: hashedPassword });

     await newAdmin.save();
    res.redirect("/admin/login"); });

 // Admin Login
 app.get("/admin/login", (req, res) => {
     res.render("admin/Login");
 });
 app.post("/admin/login", async (req, res) => {
     const { email, password } = req.body;
     const admin = await Admin.findOne({ email });

     if (!admin) {
         return res.send("Invalid Email or Password");
     }
  

     const isMatch = await bcrypt.compare(password, admin.password);
     if (!isMatch) {
         return res.send("Invalid Email or Password");
     }

     req.session.admin = admin;
     res.redirect("/admin/dashboard");
 });

 



 app.get('/user/signup', (req, res) => {
   res.render('User/Signup2'); // Ensure you have the correct path to your signup view
 });
 app.get('/user/login', (req, res) => {
   res.render('User/Login2'); // Ensure you have the correct path to your login view
 })

 app.post("/user/signup", async (req, res) => {
   const { name, email, password } = req.body;

   try {
     const existingUser = await User.findOne({ email });

    if (existingUser) {
       return res.send("User already exists.");
     }

     const hashedPassword = await bcrypt.hash(password, 10);
     const newUser = new User({ name, email, password: hashedPassword });

     await newUser.save();
     res.redirect("login"); // redirect to login page after successful signup
   } catch (error) {
     console.error("Signup error:", error);
     res.status(500).send("Server Error");
   }
 });







 // User Logout
 app.get("/user/logout", (req, res) => {
   req.session.destroy((err) => {
     if (err) {
       console.error("Logout error:", err);
       return res.status(500).send("Logout failed.");
     }
     res.redirect("/login");
   });
 });

 // Admin Dashboard with Bookings
 app.get("/admin/dashboard", async (req, res) => {
     if (!req.session.admin) {
         return res.redirect("/admin/login");     }
         const { bMonth, dMonth } = req.query;
         const filter = {};
          // Filter by Booking Month (bookingDate)
         if (bMonth) {
          const [year, month] = bMonth.split("-");
          const start = new Date(year, month - 1, 1);
          const end = new Date(year, month, 0, 23, 59, 59, 999); // end of month
          filter.bookingDate = { $gte: start, $lte: end };
      } // Filter by Delivery Month (deliveryDate)
      if (dMonth) {
        const [year, month] = dMonth.split("-");
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59, 999);
        filter.deliveryDate = { $gte: start, $lte: end };
    }
    try {
        const bookings = await Booking.find( filter);
        res.render("dashboard", { admin: req.session.admin, bookings,
          query: req.query || {}
         });
    } catch (error) {
      console.error("Error fetching bookings:", error);
        res.status(500).send("Error fetching bookings");
    }
 });

// //admin logout
app.get("/admin/logout", (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).send("Logout failed");
      }
      res.redirect("/admin/login");
  });
});
// // User signup



// // Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'process.env.EMAIL_USER',
    pass: 'process.env.EMAIL_PASS'
  }
});

// // Admin Panel
app.get('/admin/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.render('admin', { bookings,query:{} });
  } catch (error) {
    res.status(500).send('Error fetching bookings');
  }
});

// // Approve Booking and Send Email
app.post('/booking/approve', async (req, res) => {
  console.log('Received Data:', req.body); 
  
  const { bookingId, userEmail, subject, message } = req.body;
  
  if (!bookingId || !userEmail || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  try {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: 'Invalid Booking ID' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const mailOptions = {
      from: 'jasleenkaur8434@gmail.com',
      to: userEmail,
      subject,
      text: message
    };
    await Booking.findByIdAndUpdate(bookingId, { status: 'approved' });


    await transporter.sendMail(mailOptions);
    res.json({ message: 'Approval email sent successfully' });
  } catch (error) {
    console.error('Email Sending Error:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
});
// // Approve Reject and Send Email
app.post('/booking/reject', async (req, res) => {
  console.log('Received Data:', req.body); 
  
  const { bookingId, userEmail, subject, message } = req.body;
  
  if (!bookingId || !userEmail || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  try {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: 'Invalid Booking ID' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const mailOptions = {
      from: 'jasleenkaur8434@gmail.com',
      to: userEmail,
      subject,
      text: message
    };
    await Booking.findByIdAndUpdate(bookingId, { status: 'rejected' });

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Rejected email sent successfully' });
  } catch (error) {
    console.error('Email Sending Error:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
});



app.get("/Signup",async(req,res)=>{
  res.render(Signup)
})

app.get("/Login",async(req,res)=>{
  res.render(Login)
})


// // Reject Booking
app.post('/booking/reject/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.json({ message: 'Booking rejected and removed' });
    console.log("Reject request received for booking ID:", req.body.bookingId);

  } catch (error) {
    res.status(500).json({ message: 'Error rejecting booking' });
  }
});

//  //Calculate Price
const calculatePrice = (from, to, weight) => {
  const basePrice = 500;
  const distanceRates = { "Mandi Gobindgarh": 164, "Patiala": 157, "Ludhiana": 64 };
  const distanceRate = distanceRates[to] ;
  return basePrice + distanceRate * Number(weight);
}; 

// // In app.js or server.js

app.use(session({
    secret: 'yourSecretKey', // replace with a strong secret
    resave: false,
    saveUninitialized: false,
}));
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
      return next(); // User is logged in
  }
  res.redirect('/login'); // Not logged in, redirect to login
}
app.get('/booking', ensureAuthenticated, (req, res) => {
  res.render('booking');
})


app.post('/user/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user._id;
      req.session.user = user; // Optional: store full user in session
      res.redirect('/bookings');
    } else {
      res.send('Invalid credentials');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Server error during login');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
      res.redirect('/');
  });
});
app.get('/check-login', (req, res) => {
  if (req.session && req.session.userId) {
      res.json({ loggedIn: true });
  } else {
      res.json({ loggedIn: false });
  }
});
// //bookings
app.post('/bookings', upload.none(), async (req, res) => {
  if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized. Please sign up or login first.' });
  }

  try {
      const { name, email, phone, from, to, weight, Senderaddress, Receiveraddress, bDate, dDate, dTime } = req.body;

      if (!name || !email || !phone || !from || !to || !weight || !Senderaddress || !Receiveraddress || !bDate || !dDate || !dTime) {
          return res.status(400).json({ error: 'Missing required fields.' });
      }

      const price = calculatePrice(from, to, weight);

      const newBooking = new Booking({
        userId: req.session.userId,
          name,
          email,
          phone,
          from,
          to,
          weight,
          Senderaddress,
          Receiveraddress,
          bDate,
          dDate,
          dTime,
          price,
          userId: req.session.userId,
          status: 'pending'
      });

      await newBooking.save();
      res.status(201).json({ message: 'Booking successful', price });
  } catch (error) {
      console.error("Booking Error:", error);
      res.status(500).json({ error: 'An error occurred.' });
  }
});
app.post('/user/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && user.password === password) {
      req.session.userId = user._id;
      res.redirect('/booking.html'); // after login
  } else {
      res.send('Invalid credentials');
  }
});


app.post('/user/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    const existing = await User.findOne({ email });
    if (existing) return res.send('User already exists');

    // Optional: Validate the password (e.g., length check)
    if (password.length < 6) {
      return res.send('Password must be at least 6 characters');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ name, email, password: hashedPassword });

    // Save the user to the database
    await newUser.save();

    // Set the session
    req.session.userId = newUser._id;

    // Redirect to the bookings page after successful signup
    res.redirect('/bookings');
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).send('Server error during signup');
  }
});


app.get('/', (req, res) => {
  res.render('index', {
    currentPage: 'home',
    user: req.session.user || null // 👈 Pass user from session
  });
});


 app.post('/user/login', async (req, res) => {
   const { email, password } = req.body;
   const user = await User.findOne({ email })
   if (user) {
     const isMatch = await bcrypt.compare(password, user.password);
     if (isMatch) {
       req.session.user = user; // Store full user object for use in views
       req.session.userId = user._id; // Store user ID for logic purposes
       return res.redirect('/bookings'); // Redirect to bookings page after login
     } else {
       return res.render('User/Login2', { error: 'Invalid password' });
     }
   } else {
     return res.render('User/Login2', { error: 'User not found' });
   }
});
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
 });


app.post('/logout', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          console.log(err);
          return res.redirect('/');
      }
      res.clearCookie('connect.sid');
      res.redirect('/');
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});
  app.get('/', (req, res) => {
    res.render('index', {
        currentPage: 'index',
        user: req.session.user  // assuming you store user info in session
    });
});
app.get('/Panel', ensureAuthenticated, async (req, res) => {
  try {
    // Validate session
    if (!req.session.userId ) {
      return res.redirect('/login');
    }

    // Fetch user's bookings
    const userBookings = await Booking.find({ userId: req.session.userId })
      .sort({ bDate: -1 })
      .lean();
      const user = await User.findById(req.session.userId).lean();

    // Formatting functions
    const formatDate = (date) => {
      if (!date) return 'N/A';
      try {
        return new Date(date).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      } catch {
        return 'Invalid Date';
      }
    };

    const formatTime = (time) => {
      if (!time) return 'N/A';
      return time.replace(/^(\d{2})(\d{2})$/, '$1:$2');
    };

    const formatPrice = (price) => {
      if (!price) return '₹0';
      return '₹' + parseInt(price).toLocaleString('en-IN');
    };

    // Process all bookings (both current and past)
    const allBookings = userBookings.map(booking => ({
      ...booking,
      formattedBDate: formatDate(booking.bDate),
      formattedDDate: formatDate(booking.dDate),
      formattedDTime: formatTime(booking.dTime),
      formattedPrice: formatPrice(booking.price),
      formattedWeight: `${booking.weight} ton${booking.weight !== 1 ? 's' : ''}`,
      statusClass: booking.status.toLowerCase(),
      isCurrent: new Date(booking.dDate) >= new Date() || ['pending', 'approved'].includes(booking.status)
    }));
    const currentBookings = allBookings.filter(b => b.isCurrent);
    const pastBookings = allBookings.filter(b => !b.isCurrent);
    
    res.render('Panel', {
      currentPage: 'Panel',
     // userName: req.user.name, // Display the logged-in user's name
     userName: user.name || user.email,

      allBookings,
      currentBookings,
      pastBookings,
      bookingStatuses: {
        pending: 'Pending Review',
        approved: 'Approved',
        rejected: 'Rejected',
        completed: 'Completed'
      },
      helpers: {
        capitalize(str) {
          return str.charAt(0).toUpperCase() + str.slice(1);
        },
        eq(a, b) {
          return a === b;
        }
      }
    });

  } catch (error) {
    console.error("Panel Error:", error);
    res.status(500).render('error', {
      title: 'Booking Error',
      message: 'Failed to load your bookings',
      action: 'Return to Dashboard',
      actionLink: '/dashboard'
    });
  }
});

app.get('/Payment/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId).lean();

    if (!booking) return res.status(404).send('Booking not found');

    res.render('Payment', {
      booking,
      currentPage: 'Payment' // ✅ this prevents the error
    });
  } catch (error) {
    console.error('Payment Page Error:', error);
    res.status(500).send('Error loading payment page');
  }
});
app.get('/admin/bookings/filter', async (req, res) => {
  if (!req.session.admin) {
    return res.redirect('/admin/login');
  }

  const { fromDate, toDate } = req.query;
  const filter = {};

  // Booking Date Range Filter only
  if (fromDate && toDate) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    filter.bDate = {
      $gte: from,
      $lte: to
    };
  }

  try {
    const bookings = await Booking.find(filter).sort({ bDate: -1 });
    res.render('dashboard', {
      bookings,
      admin: req.session.admin,
      query: req.query
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


app.listen(PORT, () => console.log("Server running on port 3000"));


