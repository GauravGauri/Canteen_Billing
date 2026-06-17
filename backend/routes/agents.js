const express = require('express');
const router = express.Router();
const {
  getAgents,
  createAgent,
  updateAgent,
  deleteAgent,
} = require('../controllers/agentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getAgents)
  .post(createAgent);

router.route('/:id')
  .put(updateAgent)
  .delete(deleteAgent);

module.exports = router;
