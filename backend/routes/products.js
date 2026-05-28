const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.use(adminOnly);

router.route('/')
  .get(getProducts)
  .post(createProduct);

router.route('/:id')
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;
