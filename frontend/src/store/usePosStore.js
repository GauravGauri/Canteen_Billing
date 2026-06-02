import { create } from 'zustand';
import axios from 'axios';

export const usePosStore = create((set, get) => ({
  // State
  tables: [],
  dishes: [],
  categories: ['All'],
  selectedCategory: 'All',
  searchQuery: '',
  selectedTable: null,
  orderType: 'takeaway',
  cart: [],
  discount: 0,
  taxRate: 5,
  currentOrder: null,
  onlinePlatform: 'Zomato',
  tableActiveOrders: [],
  isTableModalOpen: false,
  isSettleModalOpen: false,
  showKotModal: false,
  showInvoiceModal: false,
  printedOrder: null,
  loading: false,
  message: { type: '', text: '' },
  paymentMethod: 'cash',
  paymentDetails: '',

  // Actions
  showMsg: (type, text) => {
    set({ message: { type, text } });
    setTimeout(() => set({ message: { type: '', text: '' } }), 4000);
  },

  fetchTables: async () => {
    try {
      const response = await axios.get('/tables');
      if (response.data.success) {
        set({ tables: response.data.data });
      }
    } catch (err) {
      get().showMsg('error', 'Failed to fetch dining tables');
    }
  },

  fetchDishes: async () => {
    try {
      const response = await axios.get('/dishes');
      if (response.data.success) {
        const dishes = response.data.data;
        const uniqueCats = ['All', ...new Set(dishes.map(dish => dish.category))];
        set({ dishes, categories: uniqueCats });
      }
    } catch (err) {
      get().showMsg('error', 'Failed to fetch menu dishes');
    }
  },

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsTableModalOpen: (isOpen) => set({ isTableModalOpen: isOpen }),
  setIsSettleModalOpen: (isOpen) => set({ isSettleModalOpen: isOpen }),
  setShowKotModal: (isOpen) => set({ showKotModal: isOpen }),
  setShowInvoiceModal: (isOpen) => set({ showInvoiceModal: isOpen }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setPaymentDetails: (details) => set({ paymentDetails: details }),
  setDiscount: (discount) => set({ discount: Math.max(0, Number(discount)) }),
  setOnlinePlatform: (platform) => set({ onlinePlatform: platform }),

  loadOrderIntoCart: (order) => {
    set({
      currentOrder: order,
      cart: order.items.map(item => ({
        dishId: item.dishId || `custom_${item._id || Math.random().toString(36).substr(2, 9)}`,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        isCustom: !item.dishId,
      })),
      discount: order.discount,
    });
  },

  fetchTableActiveOrders: async (tableId) => {
    try {
      const response = await axios.get('/orders', {
        params: { tableId, status: 'kitchen,served' }
      });
      if (response.data.success) {
        const activeOrders = response.data.data;
        set({ tableActiveOrders: activeOrders });
        if (activeOrders.length > 0) {
          get().loadOrderIntoCart(activeOrders[0]);
        } else {
          set({ cart: [], discount: 0, currentOrder: null });
        }
      }
    } catch (err) {
      get().showMsg('error', 'Error loading active orders for table');
    }
  },

  handleSelectTable: (table) => {
    set({ selectedTable: table, orderType: 'dine-in' });
    if (table.status !== 'available') {
      get().fetchTableActiveOrders(table._id);
    } else {
      set({ cart: [], discount: 0, currentOrder: null, tableActiveOrders: [] });
    }
  },

  selectTakeaway: () => {
    set({
      selectedTable: null,
      orderType: 'takeaway',
      cart: [],
      discount: 0,
      currentOrder: null,
      tableActiveOrders: [],
    });
  },

  selectOnline: () => {
    set({
      selectedTable: null,
      orderType: 'online',
      cart: [],
      discount: 0,
      currentOrder: null,
      tableActiveOrders: [],
    });
  },

  startNewSharedOrder: () => {
    set({ cart: [], discount: 0, currentOrder: null });
  },

  addToCart: (dish) => {
    if (!dish.isAvailable) {
      get().showMsg('error', `${dish.name} is currently out of stock/unavailable`);
      return;
    }
    const { cart } = get();
    const existingIndex = cart.findIndex(item => item.dishId === dish._id);
    const newCart = [...cart];

    if (existingIndex > -1) {
      newCart[existingIndex].quantity += 1;
    } else {
      newCart.push({
        dishId: dish._id,
        name: dish.name,
        price: dish.price,
        quantity: 1,
      });
    }
    set({ cart: newCart });
  },

  removeFromCart: (dishId) => {
    set({ cart: get().cart.filter(item => item.dishId !== dishId) });
  },

  adjustQty: (dishId, action) => {
    const { cart } = get();
    const existingIndex = cart.findIndex(item => item.dishId === dishId);
    if (existingIndex === -1) return;

    const newCart = [...cart];
    if (action === 'increase') {
      newCart[existingIndex].quantity += 1;
    } else if (action === 'decrease') {
      newCart[existingIndex].quantity -= 1;
      if (newCart[existingIndex].quantity <= 0) {
        newCart.splice(existingIndex, 1);
      }
    }
    set({ cart: newCart });
  },

  sendToKitchen: async () => {
    const { cart, selectedTable, orderType, discount, onlinePlatform, currentOrder } = get();
    if (cart.length === 0) {
      get().showMsg('error', 'Cannot send an empty order to kitchen');
      return;
    }

    set({ loading: true });
    try {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = Number(((subtotal * get().taxRate) / 100).toFixed(2));
      const netTotal = Math.max(0, subtotal + tax - discount);

      const orderPayload = {
        tableId: selectedTable ? selectedTable._id : null,
        type: orderType,
        items: cart.map(item => ({
          dishId: (item.isCustom || String(item.dishId).startsWith('custom_')) ? null : item.dishId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        subTotal: subtotal,
        tax,
        discount,
        total: netTotal,
        status: 'kitchen',
        paymentDetails: orderType === 'online' ? `Platform: ${onlinePlatform}` : get().paymentDetails,
      };

      let response;
      if (currentOrder) {
        response = await axios.put(`/orders/${currentOrder._id}`, orderPayload);
      } else {
        response = await axios.post('/orders', orderPayload);
      }

      if (response.data.success) {
        const orderData = response.data.data;
        set({ currentOrder: orderData, printedOrder: orderData, showKotModal: true });
        get().showMsg('success', 'Order sent to kitchen (KOT generated)');
        get().fetchTables();
        if (selectedTable) {
          get().fetchTableActiveOrders(selectedTable._id);
        }
      }
    } catch (err) {
      get().showMsg('error', err.response?.data?.message || 'Failed to submit kitchen order. Check inventory stock levels!');
    } finally {
      set({ loading: false });
    }
  },

  cancelOrder: async () => {
    const { currentOrder, selectedTable } = get();
    if (!currentOrder) {
      set({ cart: [], discount: 0 });
      return;
    }

    if (window.confirm('Are you sure you want to cancel this order? This will restore raw ingredients to stock.')) {
      set({ loading: true });
      try {
        const response = await axios.put(`/orders/${currentOrder._id}`, { status: 'cancelled' });
        if (response.data.success) {
          get().showMsg('success', 'Order cancelled and ingredients returned to inventory');
          set({ cart: [], discount: 0, currentOrder: null });
          get().fetchTables();
          if (selectedTable) {
            get().fetchTableActiveOrders(selectedTable._id);
          }
        }
      } catch (err) {
        get().showMsg('error', 'Error cancelling order');
      } finally {
        set({ loading: false });
      }
    }
  },

  settleOrder: async (e) => {
    if (e) e.preventDefault();
    const { cart, selectedTable, orderType, discount, onlinePlatform, currentOrder, paymentMethod, paymentDetails } = get();
    if (cart.length === 0) return;

    set({ loading: true });
    try {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = Number(((subtotal * get().taxRate) / 100).toFixed(2));
      const netTotal = Math.max(0, subtotal + tax - discount);

      let activeOrderToSettle = currentOrder;

      if (!activeOrderToSettle) {
        const createPaidPayload = {
          tableId: selectedTable ? selectedTable._id : null,
          type: orderType,
          items: cart.map(item => ({
            dishId: (item.isCustom || String(item.dishId).startsWith('custom_')) ? null : item.dishId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          subTotal: subtotal,
          tax,
          discount,
          total: netTotal,
          status: 'paid',
          paymentMethod,
          paymentDetails: orderType === 'online' ? `Platform: ${onlinePlatform}` : paymentDetails,
        };
        const response = await axios.post('/orders', createPaidPayload);
        if (response.data.success) {
          activeOrderToSettle = response.data.data;
        }
      } else {
        const response = await axios.put(`/orders/${activeOrderToSettle._id}`, {
          status: 'paid',
          paymentMethod,
          paymentDetails: orderType === 'online' ? `Platform: ${onlinePlatform}` : paymentDetails,
        });
        if (response.data.success) {
          activeOrderToSettle = response.data.data;
        }
      }

      if (activeOrderToSettle) {
        set({
          printedOrder: activeOrderToSettle,
          isSettleModalOpen: false,
          showInvoiceModal: true,
          cart: [],
          discount: 0,
          currentOrder: null,
          selectedTable: null,
          orderType: 'takeaway',
          tableActiveOrders: [],
          paymentDetails: '',
        });
        get().fetchTables();
      }
    } catch (err) {
      get().showMsg('error', err.response?.data?.message || 'Settle payment failed. Check ingredient stock levels.');
    } finally {
      set({ loading: false });
    }
  },

  quickBill: async (method = 'cash') => {
    const { cart, selectedTable, orderType, discount, onlinePlatform, currentOrder } = get();
    if (cart.length === 0) return;

    set({ loading: true });
    try {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = Number(((subtotal * get().taxRate) / 100).toFixed(2));
      const netTotal = Math.max(0, subtotal + tax - discount);

      let activeOrderToSettle = currentOrder;

      if (!activeOrderToSettle) {
        const createPaidPayload = {
          tableId: selectedTable ? selectedTable._id : null,
          type: orderType,
          items: cart.map(item => ({
            dishId: (item.isCustom || String(item.dishId).startsWith('custom_')) ? null : item.dishId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          subTotal: subtotal,
          tax,
          discount,
          total: netTotal,
          status: 'paid',
          paymentMethod: method,
          paymentDetails: orderType === 'online' ? `Platform: ${onlinePlatform}` : 'Quick Bill',
        };
        const response = await axios.post('/orders', createPaidPayload);
        if (response.data.success) {
          activeOrderToSettle = response.data.data;
        }
      } else {
        const response = await axios.put(`/orders/${activeOrderToSettle._id}`, {
          status: 'paid',
          paymentMethod: method,
          paymentDetails: orderType === 'online' ? `Platform: ${onlinePlatform}` : 'Quick Bill',
        });
        if (response.data.success) {
          activeOrderToSettle = response.data.data;
        }
      }

      if (activeOrderToSettle) {
        set({
          printedOrder: activeOrderToSettle,
          isSettleModalOpen: false,
          showInvoiceModal: true,
          cart: [],
          discount: 0,
          currentOrder: null,
          selectedTable: null,
          orderType: 'takeaway',
          tableActiveOrders: [],
          paymentDetails: '',
        });
        get().fetchTables();
        get().showMsg('success', `Quick bill settled successfully via ${method.toUpperCase()}`);
      }
    } catch (err) {
      get().showMsg('error', err.response?.data?.message || 'Quick bill settlement failed. Check ingredient stock levels.');
    } finally {
      set({ loading: false });
    }
  },
}));
