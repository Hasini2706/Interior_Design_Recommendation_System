const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

/* ===============================
   MongoDB Connection (Atlas Ready)
================================= */
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));


/* ===============================
   Basic Route
================================= */
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' });
});


/* ===============================
   User Schema
================================= */
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);


/* ===============================
   Interior Design Schema
================================= */
const designSchema = new mongoose.Schema({
  name: String,
  description: String,
  imageUrl: String,
  room: String,
  styles: [String],
  moods: [String],
  budgetRange: {
    min: Number,
    max: Number
  },
  priority: [String],
  size: [String],
  features: [String],
  createdAt: { type: Date, default: Date.now },
  createdBy: String
});

const InteriorDesign = mongoose.model('InteriorDesign', designSchema);


/* ===============================
   Authentication Routes
================================= */

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({ name, email, password });
    await user.save();

    res.json({
      message: 'User registered successfully',
      user
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    res.json({
      message: 'Login successful',
      user
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/* ===============================
   Admin Design Routes
================================= */

// Get all designs
app.get('/api/admin/designs', async (req, res) => {
  try {
    const designs = await InteriorDesign.find();
    res.json(designs);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get single design
app.get('/api/admin/designs/:id', async (req, res) => {
  try {
    const design = await InteriorDesign.findById(req.params.id);

    if (!design) {
      return res.status(404).json({
        error: 'Design not found'
      });
    }

    res.json(design);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Create new design
app.post('/api/admin/designs', async (req, res) => {
  try {

    const {
      name,
      description,
      imageUrl,
      room,
      styles,
      moods,
      budgetRange,
      priority,
      size,
      features,
      adminEmail
    } = req.body;

    const newDesign = new InteriorDesign({

      name,
      description,
      imageUrl,
      room,

      styles: Array.isArray(styles)
        ? styles
        : [styles],

      moods: Array.isArray(moods)
        ? moods
        : [moods],

      budgetRange,

      priority: Array.isArray(priority)
        ? priority
        : [priority],

      size: Array.isArray(size)
        ? size
        : [size],

      features: Array.isArray(features)
        ? features
        : [features],

      createdBy: adminEmail
    });

    await newDesign.save();

    res.json({
      message: 'Design added successfully',
      design: newDesign
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Update design
app.put('/api/admin/designs/:id', async (req, res) => {

  try {

    const {
      name,
      description,
      imageUrl,
      room,
      styles,
      moods,
      budgetRange,
      priority,
      size,
      features
    } = req.body;

    const updatedDesign =
      await InteriorDesign.findByIdAndUpdate(

        req.params.id,

        {
          name,
          description,
          imageUrl,
          room,

          styles: Array.isArray(styles)
            ? styles
            : [styles],

          moods: Array.isArray(moods)
            ? moods
            : [moods],

          budgetRange,

          priority: Array.isArray(priority)
            ? priority
            : [priority],

          size: Array.isArray(size)
            ? size
            : [size],

          features: Array.isArray(features)
            ? features
            : [features]
        },

        { new: true }
      );

    res.json({
      message: 'Design updated successfully',
      design: updatedDesign
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
});


// Delete design
app.delete('/api/admin/designs/:id', async (req, res) => {

  try {

    const deletedDesign =
      await InteriorDesign.findByIdAndDelete(
        req.params.id
      );

    if (!deletedDesign) {

      return res.status(404).json({
        error: 'Design not found'
      });

    }

    res.json({
      message: 'Design deleted successfully'
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
});


/* ===============================
   Filter Designs
================================= */

app.post('/api/admin/designs/filter', async (req, res) => {

  try {

    const {
      room,
      styles,
      moods,
      budgetMin,
      budgetMax,
      priority,
      size
    } = req.body;

    let query = {};

    if (room)
      query.room = room;

    if (styles?.length)
      query.styles = { $in: styles };

    if (moods?.length)
      query.moods = { $in: moods };

    if (budgetMin && budgetMax) {

      query.$or = [

        {
          'budgetRange.min': { $lte: budgetMax },
          'budgetRange.max': { $gte: budgetMin }

        }

      ];

    }

    if (priority?.length)
      query.priority = { $in: priority };

    if (size?.length)
      query.size = { $in: size };

    const designs =
      await InteriorDesign.find(query);

    res.json(designs);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});


/* ===============================
   Start Server
================================= */

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});