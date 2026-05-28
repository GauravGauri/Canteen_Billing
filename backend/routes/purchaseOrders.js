const express = require('express');
const router = express.Router();
const { getPOs, createPO, receivePOItems, cancelPO } = require('../controllers/poController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getPOs)
  .post(createPO);

router.route('/:id/receive')
  .post(receivePOItems);

router.route('/:id/cancel')
  .post(cancelPO);

module.exports = router;
