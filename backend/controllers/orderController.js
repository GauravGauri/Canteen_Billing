const Order = require('../models/Order');
const Table = require('../models/Table');
const Dish = require('../models/Dish');
const Product = require('../models/Product');

// Helper to generate a unique Bill number
const generateBillNumber = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await Order.countDocuments();
  const nextNum = String(count + 1).padStart(4, '0');
  return `BILL-${dateStr}-${nextNum}`;
};

// Helper function to deduct stock based on dishes ordered
const deductStock = async (orderItems) => {
  for (const item of orderItems) {
    const dish = await Dish.findById(item.dishId);
    if (dish && dish.recipe && dish.recipe.length > 0) {
      for (const ingredient of dish.recipe) {
        const product = await Product.findById(ingredient.productId);
        if (product) {
          // Deduct quantity required * quantity of dish ordered
          product.stockQuantity -= ingredient.quantity * item.quantity;
          await product.save();
        }
      }
    }
  }
};

// Helper function to restore stock (e.g. if order is cancelled)
const restoreStock = async (orderItems) => {
  for (const item of orderItems) {
    const dish = await Dish.findById(item.dishId);
    if (dish && dish.recipe && dish.recipe.length > 0) {
      for (const ingredient of dish.recipe) {
        const product = await Product.findById(ingredient.productId);
        if (product) {
          product.stockQuantity += ingredient.quantity * item.quantity;
          await product.save();
        }
      }
    }
  }
};

// @desc    Get all orders (Billing History)
// @route   GET /api/orders
// @access  Private (Admin)
const getOrders = async (req, res) => {
  const { status, type, tableId } = req.query;
  const filter = {};

  if (status) {
    if (status.includes(',')) {
      filter.status = { $in: status.split(',') };
    } else {
      filter.status = status;
    }
  }
  if (type) filter.type = type;
  if (tableId) filter.tableId = tableId;

  try {
    const orders = await Order.find(filter)
      .populate('tableId', 'tableNo')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private (Admin)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('tableId', 'tableNo');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new order (POS)
// @route   POST /api/orders
// @access  Private (Admin)
const createOrder = async (req, res) => {
  const {
    tableId,
    type,
    items,
    subTotal,
    tax,
    discount,
    total,
    status, // 'kitchen', 'served', 'paid'
    paymentMethod,
    paymentDetails,
  } = req.body;

  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items are required' });
    }

    // Verify all dishes exist
    for (const item of items) {
      const dish = await Dish.findById(item.dishId);
      if (!dish) {
        return res.status(404).json({ success: false, message: `Dish not found: ${item.name}` });
      }
    }

    const billNo = await generateBillNumber();

    const order = await Order.create({
      billNo,
      tableId: type === 'dine-in' ? tableId : null,
      type,
      items,
      subTotal,
      tax: tax || 0,
      discount: discount || 0,
      total,
      status: status || 'kitchen',
      paymentMethod: paymentMethod || 'unpaid',
      paymentDetails,
    });

    // Deduct stock if order is not pending
    if (order.status !== 'pending') {
      await deductStock(items);
    }

    // If dine-in, update table status
    if (type === 'dine-in' && tableId) {
      const table = await Table.findById(tableId);
      if (table) {
        table.status = order.status === 'paid' ? 'available' : 'occupied';
        table.currentOrderId = order.status === 'paid' ? null : order._id;
        await table.save();
      }
    }

    const populatedOrder = await Order.findById(order._id).populate('tableId', 'tableNo');
    res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status / Settle Bill
// @route   PUT /api/orders/:id
// @access  Private (Admin)
const updateOrder = async (req, res) => {
  const { status, paymentMethod, paymentDetails, discount, tax, total, subTotal, items } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const oldStatus = order.status;

    // Check if items changed (e.g. items added to running order)
    if (items && JSON.stringify(order.items) !== JSON.stringify(items)) {
      // Revert old stock deduction
      if (oldStatus !== 'pending') {
        await restoreStock(order.items);
      }
      // Save new items
      order.items = items;
      // Deduct new stock
      if (status !== 'pending') {
        await deductStock(items);
      }

      order.subTotal = subTotal !== undefined ? subTotal : order.subTotal;
      order.tax = tax !== undefined ? tax : order.tax;
      order.discount = discount !== undefined ? discount : order.discount;
      order.total = total !== undefined ? total : order.total;
    }

    // Apply status transitions
    if (status) {
      if (oldStatus === 'pending' && status === 'kitchen') {
        await deductStock(order.items);
      }

      // Handle stock changes for cancellation
      if (status === 'cancelled' && oldStatus !== 'cancelled') {
        if (oldStatus !== 'pending') {
          await restoreStock(order.items);
        }
      } else if (oldStatus === 'cancelled' && status && status !== 'cancelled') {
        if (status !== 'pending') {
          await deductStock(order.items);
        }
      }
      order.status = status;
    }

    if (paymentMethod) {
      order.paymentMethod = paymentMethod;
    }

    if (paymentDetails !== undefined) {
      order.paymentDetails = paymentDetails;
    }

    await order.save();

    // Update associated Table status
    if (order.tableId) {
      const table = await Table.findById(order.tableId);
      if (table) {
        if (order.status === 'paid' || order.status === 'cancelled') {
          // Check if there are other active orders for this table
          const otherActiveOrders = await Order.find({
            tableId: order.tableId,
            _id: { $ne: order._id },
            status: { $in: ['kitchen', 'served'] }
          });
          
          if (otherActiveOrders.length > 0) {
            table.status = 'occupied';
            table.currentOrderId = otherActiveOrders[0]._id;
          } else {
            table.status = 'available';
            table.currentOrderId = null;
          }
        } else if (order.status === 'served' || order.status === 'kitchen') {
          table.status = 'occupied';
          table.currentOrderId = order._id;
        }
        await table.save();
      }
    }

    const populatedOrder = await Order.findById(order._id).populate('tableId', 'tableNo');
    res.json({ success: true, data: populatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark KOT printed
// @route   PUT /api/orders/:id/print-kot
// @access  Private (Admin)
const printKOT = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    order.kotPrinted = true;
    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark Bill printed
// @route   PUT /api/orders/:id/print-bill
// @access  Private (Admin)
const printBill = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    order.billPrinted = true;
    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard metrics & sales statistics
// @route   GET /api/orders/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    // 1. Total revenue (aggregated directly in MongoDB)
    const paidStats = await Order.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
        },
      },
    ]);
    const totalRevenue = paidStats[0]?.totalRevenue || 0;

    // 2. Active orders count (pending, kitchen, ready, or served) - using optimized countDocuments
    const activeOrdersCount = await Order.countDocuments({ status: { $in: ['pending', 'kitchen', 'ready', 'served'] } });

    // 3. Pending bills count (unpaid pending/kitchen/ready/served orders)
    const pendingBillsCount = await Order.countDocuments({
      status: { $in: ['pending', 'kitchen', 'ready', 'served'] },
      paymentMethod: 'unpaid',
    });

    // 4. Occupied tables count
    const occupiedTablesCount = await Table.countDocuments({ status: { $in: ['occupied', 'billed'] } });

    // 5. Monthly & Yearly revenue (single aggregation filtering since start of year)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const periodicStats = await Order.aggregate([
      {
        $match: {
          status: 'paid',
          createdAt: { $gte: startOfYear },
        },
      },
      {
        $group: {
          _id: null,
          revenueThisYear: { $sum: '$total' },
          revenueThisMonth: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', startOfMonth] }, '$total', 0],
            },
          },
        },
      },
    ]);
    const revenueThisMonth = periodicStats[0]?.revenueThisMonth || 0;
    const revenueThisYear = periodicStats[0]?.revenueThisYear || 0;

    // 6. Last 7 Days Sales Trend (1 fast query + filtering in memory instead of 7 DB roundtrips)
    const startOfTrend = new Date();
    startOfTrend.setDate(startOfTrend.getDate() - 6);
    startOfTrend.setHours(0, 0, 0, 0);

    const trendOrders = await Order.find({
      status: 'paid',
      createdAt: { $gte: startOfTrend },
    })
      .select('total createdAt')
      .lean();

    const salesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const dailyOrders = trendOrders.filter((o) => o.createdAt >= d && o.createdAt < nextD);
      const revenue = dailyOrders.reduce((sum, o) => sum + o.total, 0);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      salesTrend.push({ date: dayLabel, revenue });
    }

    // 7. Category-wise sales distribution (aggregated using $lookup, $unwind, and $group in DB)
    const categorySales = await Order.aggregate([
      { $match: { status: 'paid' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'dishes',
          localField: 'items.dishId',
          foreignField: '_id',
          as: 'dishDetails',
        },
      },
      { $unwind: { path: '$dishDetails', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$dishDetails.category', 'Other'] },
          value: { $sum: '$items.quantity' },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue,
        activeOrdersCount,
        pendingBillsCount,
        occupiedTablesCount,
        revenueThisMonth,
        revenueThisYear,
        salesTrend,
        categorySales,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  printKOT,
  printBill,
  getDashboardStats,
};
