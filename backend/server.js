require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');
const Table = require('./models/Table');

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('Canteen Billing and Inventory System API is running...');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/products', require('./routes/products'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/dishes', require('./routes/dishes'));
app.use('/api/purchase-orders', require('./routes/purchaseOrders'));
app.use('/api/orders', require('./routes/orders'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error' });
});

// Auto-seed admin and default tables on launch
const seedData = async () => {
  try {
    // 1. Seed Admin if no admin exists
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      await User.create({
        username: 'admin',
        password: 'admin123', // Will be hashed via pre-save hook
        role: 'admin',
      });
      console.log('Successfully Seeded Default Admin (Username: admin, Password: admin123)');
    }

    // 2. Seed default tables if none exist
    const tableCount = await Table.countDocuments();
    if (tableCount === 0) {
      const defaultTables = [
        { tableNo: 'Table 1', capacity: 2 },
        { tableNo: 'Table 2', capacity: 2 },
        { tableNo: 'Table 3', capacity: 4 },
        { tableNo: 'Table 4', capacity: 4 },
        { tableNo: 'Table 5', capacity: 6 },
        { tableNo: 'Table 6', capacity: 8 },
      ];
      await Table.insertMany(defaultTables);
      console.log('Successfully Seeded Default Dining Tables (Table 1 - Table 6)');
    }
  } catch (err) {
    console.error('Seeding error: ', err.message);
  }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  await seedData();
});
