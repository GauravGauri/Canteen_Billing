const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  printKOT,
  printBill,
  getDashboardStats,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/stats')
  .get(getDashboardStats);

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id')
  .get(getOrderById)
  .put(updateOrder);

router.route('/:id/print-kot')
  .put(printKOT);

router.route('/:id/print-bill')
  .put(printBill);

module.exports = router;
