const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

// Helper to generate a unique PO number
const generatePONumber = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await PurchaseOrder.countDocuments();
  const nextNum = String(count + 1).padStart(4, '0');
  return `PO-${dateStr}-${nextNum}`;
};

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private (Admin)
const getPOs = async (req, res) => {
  try {
    const pos = await PurchaseOrder.find({})
      .populate('supplierId', 'name contactPerson phone')
      .populate('items.productId', 'name unit stockQuantity minStockLevel')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: pos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new purchase order
// @route   POST /api/purchase-orders
// @access  Private (Admin)
const createPO = async (req, res) => {
  const { supplierId, items } = req.body;

  try {
    if (!supplierId || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Supplier and items are required' });
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    let totalAmount = 0;
    const poItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      }

      const costPrice = item.costPrice || product.costPrice;
      const quantityOrdered = Number(item.quantityOrdered);

      if (isNaN(quantityOrdered) || quantityOrdered <= 0) {
        return res.status(400).json({ success: false, message: `Invalid quantity for product ${product.name}` });
      }

      totalAmount += costPrice * quantityOrdered;

      poItems.push({
        productId: item.productId,
        quantityOrdered,
        quantityReceived: 0,
        costPrice,
      });
    }

    const poNumber = await generatePONumber();

    const po = await PurchaseOrder.create({
      poNumber,
      supplierId,
      items: poItems,
      totalAmount,
      status: 'ordered',
    });

    const populatedPO = await PurchaseOrder.findById(po._id)
      .populate('supplierId', 'name')
      .populate('items.productId', 'name unit');

    res.status(201).json({ success: true, data: populatedPO });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Receive products for a purchase order (Updates Inventory)
// @route   POST /api/purchase-orders/:id/receive
// @access  Private (Admin)
const receivePOItems = async (req, res) => {
  const { itemsReceived } = req.body; // Array of { productId, quantityReceived }

  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    if (po.status === 'received' || po.status === 'cancelled') {
      return res.status(400).json({ success: false, message: `Cannot receive items for a PO with status: ${po.status}` });
    }

    // Update received quantities and product inventory stock
    for (const itemRec of itemsReceived) {
      const poItem = po.items.find(item => item.productId.toString() === itemRec.productId.toString());

      if (poItem) {
        const qtyToReceive = Number(itemRec.quantityReceived);
        if (isNaN(qtyToReceive) || qtyToReceive < 0) {
          continue;
        }

        // Limit checking: cannot receive more than ordered (or can they? Let's check how much is remaining)
        const remainingToReceive = poItem.quantityOrdered - poItem.quantityReceived;
        
        // We will allow receiving up to the remaining ordered quantity.
        const actualReceived = Math.min(qtyToReceive, remainingToReceive);
        
        if (actualReceived > 0) {
          poItem.quantityReceived += actualReceived;

          // Increase stock in Product inventory
          const product = await Product.findById(itemRec.productId);
          if (product) {
            product.stockQuantity += actualReceived;
            // Also update the average cost price based on this PO purchase if necessary
            product.costPrice = poItem.costPrice;
            await product.save();
          }
        }
      }
    }

    // Determine PO status
    let allReceived = true;
    let someReceived = false;

    for (const item of po.items) {
      if (item.quantityReceived < item.quantityOrdered) {
        allReceived = false;
      }
      if (item.quantityReceived > 0) {
        someReceived = true;
      }
    }

    if (allReceived) {
      po.status = 'received';
      po.receivedDate = Date.now();
    } else if (someReceived) {
      po.status = 'partially_received';
    }

    await po.save();

    const populatedPO = await PurchaseOrder.findById(po._id)
      .populate('supplierId', 'name contactPerson phone')
      .populate('items.productId', 'name unit stockQuantity minStockLevel');

    res.json({ success: true, data: populatedPO });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a purchase order
// @route   POST /api/purchase-orders/:id/cancel
// @access  Private (Admin)
const cancelPO = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    if (po.status !== 'ordered') {
      return res.status(400).json({ success: false, message: `Cannot cancel a PO that is ${po.status}` });
    }

    po.status = 'cancelled';
    await po.save();

    res.json({ success: true, data: po });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPOs,
  createPO,
  receivePOItems,
  cancelPO,
};
