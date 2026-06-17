const express = require('express');
const router = express.Router();
const {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  getDashboardStats,
} = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/dashboard/stats')
  .get(getDashboardStats);

router.route('/')
  .get(getReservations)
  .post(createReservation);

router.route('/:id')
  .get(getReservationById)
  .put(updateReservation)
  .delete(deleteReservation);

module.exports = router;
