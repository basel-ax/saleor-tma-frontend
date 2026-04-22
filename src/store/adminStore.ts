import create from "zustand";
import type { AdminRole, AdminChannel } from "../types";
import { fetchIsSuperadmin, fetchMyChannels } from "../api";

const ADMIN_STORAGE_KEY = "food-order-admin";

function saveAdminState(
   state: { isSuperadminChecked: boolean; isSuperadmin: boolean; role: AdminRole } | null,
): void {
   try {
      if (state) {
         localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(state));
      } else {
         localStorage.removeItem(ADMIN_STORAGE_KEY);
      }
   } catch {
      // ignore storage errors
   }
}

interface AdminState {
   isSuperadminChecked: boolean;
   isSuperadmin: boolean;
   myChannels: AdminChannel[];
   role: AdminRole;
   isLoading: boolean;

   checkAdminStatus: () => Promise<void>;
   setMyChannels: (channels: AdminChannel[]) => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
   isSuperadminChecked: false,
   isSuperadmin: false,
   myChannels: [],
   role: "none",
   isLoading: false,

   checkAdminStatus: async () => {
      const { isSuperadminChecked } = get();
      if (isSuperadminChecked) return;

      set({ isLoading: true });

      try {
         const isSuperadmin = await fetchIsSuperadmin();

         let role: AdminRole = "none";
         if (isSuperadmin) {
            role = "superadmin";
         } else {
            const channels = await fetchMyChannels();
            const adminChannels = channels.filter((c) => c.hasAdmin);
            if (adminChannels.length > 0) {
               role = "channel-admin";
               set({ myChannels: adminChannels });
            }
         }

         set({
            isSuperadminChecked: true,
            isSuperadmin: isSuperadmin,
            role,
            isLoading: false,
         });

         saveAdminState({ isSuperadminChecked: true, isSuperadmin, role });
      } catch (error) {
         console.error("Failed to check admin status:", error);
         set({ isSuperadminChecked: true, role: "none", isLoading: false });
      }
   },

   setMyChannels: (channels: AdminChannel[]) => {
      set({ myChannels: channels });
   },
}));