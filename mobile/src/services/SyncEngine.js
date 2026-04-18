// mobile/src/services/SyncEngine.js
import NetInfo from "@react-native-community/netinfo";
import { AppState } from "react-native";
import { getQueue, PAYMENT_STATUS } from './queueService';
import { setItem } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import api from './api.service';

class SyncEngine {
  constructor() { this.isSyncing = false; }
  init() {
    NetInfo.addEventListener(state => { if (state.isConnected) this.attemptSync(); });
    AppState.addEventListener("change", state => { if (state === "active") this.attemptSync(); });
    this.attemptSync();
  }
  async attemptSync() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    try {
      const queue = await getQueue();
      const pending = queue.filter(i => i.status === 'pending');
      for (let item of pending) {
        try {
          await api.post('/queue/sync', item);
          await this.removeFromQueue(item.localId);
        } catch (e) { console.error("Sync per-item fail:", e); }
      }
    } finally { this.isSyncing = false; }
  }
  async removeFromQueue(id) {
    const q = await getQueue();
    await setItem(STORAGE_KEYS.OFFLINE_QUEUE, q.filter(i => i.localId !== id));
  }
}
export default new SyncEngine();
