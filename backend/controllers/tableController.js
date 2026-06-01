const Table = require('../models/Table');

// @desc    Get all tables
// @route   GET /api/tables
// @access  Private (Admin)
const getTables = async (req, res) => {
  try {
    const tables = await Table.find({}).populate('currentOrderId').sort({ tableNo: 1 }).lean();
    res.json({ success: true, data: tables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a table
// @route   POST /api/tables
// @access  Private (Admin)
const createTable = async (req, res) => {//checking gaurav
  const { tableNo, capacity } = req.body;

  try {
    if (!tableNo) {
      return res.status(400).json({ success: false, message: 'Table number/name is required' });
    }

    const exists = await Table.findOne({ tableNo });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Table already exists' });
    }

    const table = await Table.create({
      tableNo,
      capacity: capacity || 4,
      status: 'available',
    });

    res.status(201).json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a table
// @route   PUT /api/tables/:id
// @access  Private (Admin)
const updateTable = async (req, res) => {
  const { tableNo, capacity, status, currentOrderId } = req.body;

  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    table.tableNo = tableNo || table.tableNo;
    table.capacity = capacity !== undefined ? capacity : table.capacity;
    table.status = status || table.status;
    table.currentOrderId = currentOrderId !== undefined ? currentOrderId : table.currentOrderId;

    const updatedTable = await table.save();
    res.json({ success: true, data: updatedTable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a table
// @route   DELETE /api/tables/:id
// @access  Private (Admin)
const deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    if (table.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Cannot delete an occupied or billed table' });
    }

    await table.deleteOne();
    res.json({ success: true, message: 'Table removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTables,
  createTable,
  updateTable,
  deleteTable,
};
