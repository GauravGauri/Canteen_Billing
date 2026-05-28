const express = require('express');
const router = express.Router();
const { getTables, createTable, updateTable, deleteTable } = require('../controllers/tableController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.use(adminOnly);

router.route('/')
  .get(getTables)
  .post(createTable);

router.route('/:id')
  .put(updateTable)
  .delete(deleteTable);

module.exports = router;
