import { create } from "zustand";

// Real shapes per the backend's Problems factory: insufficientCredits(required, balance) and
// planLimitReached(feature, limit, current).
export type UpgradeModalDetails = { required: number; balance: number } | { feature: string; limit: number; current: number } | Record<string, unknown>;

interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  upgradeModalOpen: boolean;
  upgradeModalDetails: UpgradeModalDetails | null;
  openUpgradeModal: (details?: UpgradeModalDetails) => void;
  closeUpgradeModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  upgradeModalOpen: false,
  upgradeModalDetails: null,
  openUpgradeModal: (details) => set({ upgradeModalOpen: true, upgradeModalDetails: details ?? null }),
  closeUpgradeModal: () => set({ upgradeModalOpen: false, upgradeModalDetails: null }),
}));
