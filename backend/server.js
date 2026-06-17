require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');
const Table = require('./models/Table');
const Order = require('./models/Order');
const Dish = require('./models/Dish');
const RoomCategory = require('./models/RoomCategory');
const Room = require('./models/Room');
const Guest = require('./models/Guest');
const Supplier = require('./models/Supplier');
const Setting = require('./models/Setting');

const compression = require('compression');

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(compression());
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('Hotel & Resort Management ERP API is running...');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/products', require('./routes/products'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/dishes', require('./routes/dishes'));
app.use('/api/purchase-orders', require('./routes/purchaseOrders'));
app.use('/api/orders', require('./routes/orders'));

// Hotel operations routes
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/guests', require('./routes/guests'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/settings', require('./routes/settings'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error' });
});

// Auto-seed admin and default tables on launch
const seedData = async () => {
  try {
    // 1. Seed Role-Based Users
    const rolesToSeed = [
      { username: 'superadmin', password: 'admin123', role: 'super_admin' },
      { username: 'manager', password: 'manager123', role: 'hotel_manager' },
      { username: 'frontdesk', password: 'frontdesk123', role: 'front_desk' },
      { username: 'restaurant', password: 'restaurant123', role: 'restaurant_staff' },
      { username: 'accountant', password: 'accountant123', role: 'accountant' },
      { username: 'inventory', password: 'inventory123', role: 'inventory_manager' },
      { username: 'admin', password: 'admin123', role: 'admin' }, // keep old admin for compatibility
    ];

    for (const r of rolesToSeed) {
      const userExists = await User.findOne({ username: r.username });
      if (!userExists) {
        await User.create(r);
        console.log(`Seeded user: ${r.username} (${r.role})`);
      }
    }

    // 2. Seed Default Settings
    const settingCount = await Setting.countDocuments();
    if (settingCount === 0) {
      await Setting.create({
        hotelName: 'The Grand Resort & Spa',
        address: '101 Resort Boulevard, Beachside',
        phone: '+1 (555) 019-2834',
        email: 'contact@grandresort.com',
        currency: 'USD',
        currencySymbol: '$',
        taxRate: 12,
        serviceChargeRate: 5,
        invoiceTemplate: 'classic',
        emailConfigured: false,
        smsConfigured: false,
      });
      console.log('Seeded Default settings.');
    }

    // 3. Seed Default Room Categories
    const categoryCount = await RoomCategory.countDocuments();
    let deluxeId, suiteId, standardId;
    if (categoryCount === 0) {
      const standard = await RoomCategory.create({
        name: 'Standard Room',
        description: 'Cozy and budget-friendly room with basic amenities.',
        basePrice: 90,
        maxOccupancy: 2,
        amenities: ['Free Wi-Fi', 'TV', 'Air Conditioning', 'Shower'],
      });
      const deluxe = await RoomCategory.create({
        name: 'Deluxe Room',
        description: 'Spacious room with king bed, ocean view, and premium comfort.',
        basePrice: 150,
        maxOccupancy: 3,
        amenities: ['Free Wi-Fi', 'Smart TV', 'Air Conditioning', 'Ocean View', 'Mini Bar'],
      });
      const suite = await RoomCategory.create({
        name: 'Executive Suite',
        description: 'Luxury multi-room suite with private jacuzzi and lounge access.',
        basePrice: 250,
        maxOccupancy: 4,
        amenities: ['Free Wi-Fi', 'Smart TV', 'Air Conditioning', 'Jacuzzi', 'Mini Bar', 'Lounge Access', 'Butler Service'],
      });
      standardId = standard._id;
      deluxeId = deluxe._id;
      suiteId = suite._id;
      console.log('Seeded Default Room Categories.');
    } else {
      const standardCat = await RoomCategory.findOne({ name: 'Standard Room' });
      const deluxeCat = await RoomCategory.findOne({ name: 'Deluxe Room' });
      const suiteCat = await RoomCategory.findOne({ name: 'Executive Suite' });
      if (standardCat) standardId = standardCat._id;
      if (deluxeCat) deluxeId = deluxeCat._id;
      if (suiteCat) suiteId = suiteCat._id;
    }

    // 4. Seed Default Rooms
    const roomCount = await Room.countDocuments();
    if (roomCount === 0 && standardId && deluxeId && suiteId) {
      const defaultRooms = [
        { roomNo: '101', categoryId: standardId, status: 'available', cleaningStatus: 'clean', notes: 'First floor corner' },
        { roomNo: '102', categoryId: standardId, status: 'available', cleaningStatus: 'clean', notes: 'First floor near elevator' },
        { roomNo: '103', categoryId: standardId, status: 'available', cleaningStatus: 'clean', notes: 'First floor standard' },
        { roomNo: '201', categoryId: deluxeId, status: 'available', cleaningStatus: 'clean', notes: 'Second floor ocean facing' },
        { roomNo: '202', categoryId: deluxeId, status: 'available', cleaningStatus: 'clean', notes: 'Second floor garden facing' },
        { roomNo: '203', categoryId: deluxeId, status: 'available', cleaningStatus: 'clean', notes: 'Second floor deluxe' },
        { roomNo: '301', categoryId: suiteId, status: 'available', cleaningStatus: 'clean', notes: 'Penthouse floor west wing' },
        { roomNo: '302', categoryId: suiteId, status: 'available', cleaningStatus: 'clean', notes: 'Penthouse floor east wing' },
      ];
      await Room.insertMany(defaultRooms);
      console.log('Seeded Default Rooms.');
    }

    // 5. Seed Default Guests
    const guestCount = await Guest.countDocuments();
    if (guestCount === 0) {
      await Guest.create([
        { name: 'Gaurav Kumar', email: 'gaurav@example.com', phone: '+1 555-123-4567', idType: 'Passport', idNumber: 'P1234567', preferences: 'High floor, feather pillows', loyaltyPoints: 120, visitCount: 3, specialRequests: 'Late checkout if possible' },
        { name: 'Gauri Sharma', email: 'gauri@example.com', phone: '+1 555-987-6543', idType: 'National ID', idNumber: 'N7654321', preferences: 'Decaf coffee, extra towels', loyaltyPoints: 50, visitCount: 1 }
      ]);
      console.log('Seeded Default Guests.');
    }

    // 6. Seed default dining tables if none exist (keep backward compatibility)
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

    // 7. Seed Default Suppliers
    const supplierCount = await Supplier.countDocuments();
    if (supplierCount === 0) {
      await Supplier.create([
        { supplierName: 'Metro Food Distributors', contactName: 'John Doe', phone: '555-111-2222', email: 'john@metrofood.com', address: '45 Food Court Way', vendorRating: 4.5, paymentDueAmount: 0 },
        { supplierName: 'Resort Linen & Laundry Co', contactName: 'Jane Smith', phone: '555-333-4444', email: 'jane@resortlinen.com', address: '12 Laundry Lane', vendorRating: 4.8, paymentDueAmount: 0 }
      ]);
      console.log('Seeded Default Suppliers.');
    }

    // 8. Seed default dishes if empty
    const dishCount = await Dish.countDocuments();
    if (dishCount === 0) {
      await Dish.create([
        { name: 'Chicken Biryani', category: 'Main Course', price: 15, isAvailable: true },
        { name: 'Paneer Tikka Masala', category: 'Main Course', price: 12, isAvailable: true },
        { name: 'Caesar Salad', category: 'Salads', price: 9, isAvailable: true },
        { name: 'Chocolate Lava Cake', category: 'Dessert', price: 7, isAvailable: true },
        { name: 'Club Sandwich', category: 'Snacks', price: 8, isAvailable: true },
        { name: 'Fresh Orange Juice', category: 'Beverages', price: 5, isAvailable: true },
      ]);
      console.log('Seeded default restaurant dishes.');
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
