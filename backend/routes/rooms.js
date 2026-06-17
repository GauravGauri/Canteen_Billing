const express = require('express');
const router = express.Router();
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomCategories,
  createRoomCategory,
} = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/categories')
  .get(getRoomCategories)
  .post(createRoomCategory);

router.route('/')
  .get(getRooms)
  .post(createRoom);

router.route('/:id')
  .get(getRoomById)
  .put(updateRoom)
  .delete(deleteRoom);

module.exports = router;
