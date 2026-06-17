import { create } from 'zustand';
import axios from 'axios';

export const useHotelStore = create((set, get) => ({
  // State variables
  stats: null,
  rooms: [],
  categories: [],
  reservations: [],
  guests: [],
  agents: [],
  groups: [],
  settings: null,
  inventory: [],
  suppliers: [],
  purchaseOrders: [],
  loading: false,
  message: { type: '', text: '' },

  // Helper actions
  showMsg: (type, text) => {
    set({ message: { type, text } });
    setTimeout(() => set({ message: { type: '', text: '' } }), 4000);
  },

  // 1. Dashboard Stats
  fetchDashboardStats: async () => {
    set({ loading: true });
    try {
      const res = await axios.get('/reservations/dashboard/stats');
      if (res.data.success) {
        set({ stats: res.data.data });
      }
    } catch (err) {
      get().showMsg('error', 'Failed to fetch dashboard statistics.');
    } finally {
      set({ loading: false });
    }
  },

  // 2. Rooms & Categories
  fetchRooms: async () => {
    try {
      const res = await axios.get('/rooms');
      if (res.data.success) set({ rooms: res.data.data });
    } catch (err) {
      get().showMsg('error', 'Failed to load rooms.');
    }
  },

  fetchRoomCategories: async () => {
    try {
      const res = await axios.get('/rooms/categories');
      if (res.data.success) set({ categories: res.data.data });
    } catch (err) {
      get().showMsg('error', 'Failed to load room categories.');
    }
  },

  createRoom: async (roomData) => {
    try {
      const res = await axios.post('/rooms', roomData);
      if (res.data.success) {
        set({ rooms: [...get().rooms, res.data.data] });
        get().showMsg('success', `Room ${roomData.roomNo} created successfully.`);
        return true;
      }
    } catch (err) {
      get().showMsg('error', err.response?.data?.message || 'Failed to create room.');
      return false;
    }
  },

  updateRoom: async (id, roomData) => {
    try {
      const res = await axios.put(`/rooms/${id}`, roomData);
      if (res.data.success) {
        set({
          rooms: get().rooms.map((room) => (room._id === id ? res.data.data : room)),
        });
        get().showMsg('success', 'Room updated successfully.');
        return true;
      }
    } catch (err) {
      get().showMsg('error', err.response?.data?.message || 'Failed to update room.');
      return false;
    }
  },

  deleteRoom: async (id) => {
    try {
      const res = await axios.delete(`/rooms/${id}`);
      if (res.data.success) {
        set({ rooms: get().rooms.filter((room) => room._id !== id) });
        get().showMsg('success', 'Room deleted successfully.');
        return true;
      }
    } catch (err) {
      get().showMsg('error', 'Failed to delete room.');
      return false;
    }
  },

  createRoomCategory: async (catData) => {
    try {
      const res = await axios.post('/rooms/categories', catData);
      if (res.data.success) {
        set({ categories: [...get().categories, res.data.data] });
        get().showMsg('success', `Room Category ${catData.name} created.`);
        return true;
      }
    } catch (err) {
      get().showMsg('error', err.response?.data?.message || 'Failed to create category.');
      return false;
    }
  },

  // 3. Guests
  fetchGuests: async (search = '') => {
    try {
      const res = await axios.get('/guests', { params: { search } });
      if (res.data.success) set({ guests: res.data.data });
    } catch (err) {
      get().showMsg('error', 'Failed to load guests.');
    }
  },

  createGuest: async (guestData) => {
    try {
      const res = await axios.post('/guests', guestData);
      if (res.data.success) {
        set({ guests: [res.data.data, ...get().guests] });
        get().showMsg('success', 'Guest profile created.');
        return res.data.data;
      }
    } catch (err) {
      get().showMsg('error', 'Failed to create guest.');
      return null;
    }
  },

  updateGuest: async (id, guestData) => {
    try {
      const res = await axios.put(`/guests/${id}`, guestData);
      if (res.data.success) {
        set({
          guests: get().guests.map((g) => (g._id === id ? res.data.data : g)),
        });
        get().showMsg('success', 'Guest profile updated.');
        return true;
      }
    } catch (err) {
      get().showMsg('error', 'Failed to update guest.');
      return false;
    }
  },

  deleteGuest: async (id) => {
    try {
      const res = await axios.delete(`/guests/${id}`);
      if (res.data.success) {
        set({ guests: get().guests.filter((g) => g._id !== id) });
        get().showMsg('success', 'Guest deleted.');
        return true;
      }
    } catch (err) {
      get().showMsg('error', 'Failed to delete guest.');
      return false;
    }
  },

  // 4. Reservations
  fetchReservations: async () => {
    try {
      const res = await axios.get('/reservations');
      if (res.data.success) set({ reservations: res.data.data });
    } catch (err) {
      get().showMsg('error', 'Failed to load reservations.');
    }
  },

  createReservation: async (resData) => {
    try {
      const res = await axios.post('/reservations', resData);
      if (res.data.success) {
        set({ reservations: [res.data.data, ...get().reservations] });
        get().showMsg('success', 'Reservation booked successfully.');
        get().fetchRooms(); // refresh room statuses
        return true;
      }
    } catch (err) {
      get().showMsg('error', err.response?.data?.message || 'Booking failed.');
      return false;
    }
  },

  updateReservation: async (id, resData) => {
    try {
      const res = await axios.put(`/reservations/${id}`, resData);
      if (res.data.success) {
        set({
          reservations: get().reservations.map((r) => (r._id === id ? res.data.data : r)),
        });
        get().showMsg('success', 'Reservation updated.');
        get().fetchRooms(); // refresh room statuses
        return true;
      }
    } catch (err) {
      get().showMsg('error', err.response?.data?.message || 'Failed to update reservation.');
      return false;
    }
  },

  deleteReservation: async (id) => {
    try {
      const res = await axios.delete(`/reservations/${id}`);
      if (res.data.success) {
        set({ reservations: get().reservations.filter((r) => r._id !== id) });
        get().showMsg('success', 'Reservation cancelled/removed.');
        get().fetchRooms();
        return true;
      }
    } catch (err) {
      get().showMsg('error', 'Failed to delete reservation.');
      return false;
    }
  },

  // 5. Agents
  fetchAgents: async () => {
    try {
      const res = await axios.get('/agents');
      if (res.data.success) set({ agents: res.data.data });
    } catch (err) {
      get().showMsg('error', 'Failed to load agents.');
    }
  },

  createAgent: async (agentData) => {
    try {
      const res = await axios.post('/agents', agentData);
      if (res.data.success) {
        set({ agents: [...get().agents, res.data.data] });
        get().showMsg('success', `Agent ${agentData.agentName} registered.`);
        return true;
      }
    } catch (err) {
      get().showMsg('error', err.response?.data?.message || 'Registration failed.');
      return false;
    }
  },

  updateAgent: async (id, agentData) => {
    try {
      const res = await axios.put(`/agents/${id}`, agentData);
      if (res.data.success) {
        set({
          agents: get().agents.map((a) => (a._id === id ? res.data.data : a)),
        });
        get().showMsg('success', 'Agent details updated.');
        return true;
      }
    } catch (err) {
      get().showMsg('error', 'Failed to update agent.');
      return false;
    }
  },

  deleteAgent: async (id) => {
    try {
      const res = await axios.delete(`/agents/${id}`);
      if (res.data.success) {
        set({ agents: get().agents.filter((a) => a._id !== id) });
        get().showMsg('success', 'Agent removed.');
        return true;
      }
    } catch (err) {
      get().showMsg('error', 'Failed to delete agent.');
      return false;
    }
  },

  // 6. Group Bookings
  fetchGroups: async () => {
    try {
      const res = await axios.get('/groups');
      if (res.data.success) set({ groups: res.data.data });
    } catch (err) {
      get().showMsg('error', 'Failed to load group bookings.');
    }
  },

  createGroup: async (groupData) => {
    try {
      const res = await axios.post('/groups', groupData);
      if (res.data.success) {
        set({ groups: [...get().groups, res.data.data] });
        get().showMsg('success', `Group booking ${groupData.groupName} created.`);
        get().fetchRooms();
        return true;
      }
    } catch (err) {
      get().showMsg('error', err.response?.data?.message || 'Group booking failed.');
      return false;
    }
  },

  updateGroup: async (id, groupData) => {
    try {
      const res = await axios.put(`/groups/${id}`, groupData);
      if (res.data.success) {
        set({
          groups: get().groups.map((g) => (g._id === id ? res.data.data : g)),
        });
        get().showMsg('success', 'Group booking updated.');
        return true;
      }
    } catch (err) {
      get().showMsg('error', 'Failed to update group booking.');
      return false;
    }
  },

  deleteGroup: async (id) => {
    try {
      const res = await axios.delete(`/groups/${id}`);
      if (res.data.success) {
        set({ groups: get().groups.filter((g) => g._id !== id) });
        get().showMsg('success', 'Group booking removed.');
        get().fetchRooms();
        return true;
      }
    } catch (err) {
      get().showMsg('error', 'Failed to delete group booking.');
      return false;
    }
  },

  // 7. Settings
  fetchSettings: async () => {
    try {
      const res = await axios.get('/settings');
      if (res.data.success) set({ settings: res.data.data });
    } catch (err) {
      get().showMsg('error', 'Failed to load system settings.');
    }
  },

  updateSettings: async (settingsData) => {
    try {
      const res = await axios.put('/settings', settingsData);
      if (res.data.success) {
        set({ settings: res.data.data });
        get().showMsg('success', 'System settings updated.');
        return true;
      }
    } catch (err) {
      get().showMsg('error', 'Failed to update settings.');
      return false;
    }
  },

  // 8. Inventory, Suppliers, and POs (MERN compatibility)
  fetchInventory: async () => {
    try {
      const res = await axios.get('/products');
      if (res.data.success) set({ inventory: res.data.data });
    } catch (err) {
      get().showMsg('error', 'Failed to load inventory.');
    }
  },

  createInventoryItem: async (item) => {
    try {
      const res = await axios.post('/products', item);
      if (res.data.success) {
        set({ inventory: [...get().inventory, res.data.data] });
        get().showMsg('success', 'Stock item added.');
        return true;
      }
    } catch (err) {
      get().showMsg('error', 'Failed to create item.');
      return false;
    }
  },

  updateInventoryItem: async (id, item) => {
    try {
      const res = await axios.put(`/products/${id}`, item);
      if (res.data.success) {
        set({ inventory: get().inventory.map(i => i._id === id ? res.data.data : i) });
        get().showMsg('success', 'Stock item updated.');
        return true;
      }
    } catch (err) {
      get().showMsg('error', 'Failed to update item.');
      return false;
    }
  },

  fetchSuppliers: async () => {
    try {
      const res = await axios.get('/suppliers');
      if (res.data.success) set({ suppliers: res.data.data });
    } catch (err) {
      get().showMsg('error', 'Failed to load suppliers.');
    }
  },

  createSupplier: async (sup) => {
    try {
      const res = await axios.post('/suppliers', sup);
      if (res.data.success) {
        set({ suppliers: [...get().suppliers, res.data.data] });
        get().showMsg('success', 'Supplier created.');
        return true;
      }
    } catch (err) {
      get().showMsg('error', 'Failed to create supplier.');
      return false;
    }
  },

  updateSupplier: async (id, sup) => {
    try {
      const res = await axios.put(`/suppliers/${id}`, sup);
      if (res.data.success) {
        set({ suppliers: get().suppliers.map(s => s._id === id ? res.data.data : s) });
        get().showMsg('success', 'Supplier updated.');
        return true;
      }
    } catch (err) {
      get().showMsg('error', 'Failed to update supplier.');
      return false;
    }
  },

  fetchPurchaseOrders: async () => {
    try {
      const res = await axios.get('/purchase-orders');
      if (res.data.success) set({ purchaseOrders: res.data.data });
    } catch (err) {
      get().showMsg('error', 'Failed to load purchase orders.');
    }
  },

  createPurchaseOrder: async (po) => {
    try {
      const res = await axios.post('/purchase-orders', po);
      if (res.data.success) {
        set({ purchaseOrders: [res.data.data, ...get().purchaseOrders] });
        get().showMsg('success', 'Purchase order created.');
        return true;
      }
    } catch (err) {
      get().showMsg('error', 'Failed to create PO.');
      return false;
    }
  },

  updatePurchaseOrder: async (id, po) => {
    try {
      const res = await axios.put(`/purchase-orders/${id}`, po);
      if (res.data.success) {
        set({ purchaseOrders: get().purchaseOrders.map(p => p._id === id ? res.data.data : p) });
        get().showMsg('success', 'Purchase order updated.');
        return true;
      }
    } catch (err) {
      get().showMsg('error', 'Failed to update PO.');
      return false;
    }
  },
}));
