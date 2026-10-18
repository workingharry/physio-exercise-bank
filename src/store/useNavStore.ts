import { useState, useEffect } from 'react';

const PINNED_CONDITIONS_KEY = 'physiobank_pinned_conditions_v1';
const RECENT_CONDITIONS_KEY = 'physiobank_recent_conditions_v1';
const SIDEBAR_COLLAPSED_KEY = 'physiobank_sidebar_collapsed_v1';
const THEME_KEY = 'physiobank_theme_v1';

export type AppTheme = 'dark' | 'light' | 'system';

// Simple external listeners pattern so all components using useNavStore stay in sync
type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

// In-memory singletons backed by localStorage
let state = {
  isMobileDrawerOpen: false,
  isSidebarCollapsed: (() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      return saved ? JSON.parse(saved) === true : false;
    } catch {
      return false;
    }
  })(),
  pinnedConditionIds: (() => {
    try {
      const saved = localStorage.getItem(PINNED_CONDITIONS_KEY);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  })(),
  recentConditionIds: (() => {
    try {
      const saved = localStorage.getItem(RECENT_CONDITIONS_KEY);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  })(),
  theme: (() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light' || saved === 'system') return saved as AppTheme;
      return 'dark';
    } catch {
      return 'dark';
    }
  })() as AppTheme,
  isDataStatusOpen: false
};

export function useNavStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setMobileDrawerOpen = (open: boolean) => {
    state.isMobileDrawerOpen = open;
    emitChange();
  };

  const toggleMobileDrawer = () => {
    state.isMobileDrawerOpen = !state.isMobileDrawerOpen;
    emitChange();
  };

  const setSidebarCollapsed = (collapsed: boolean) => {
    state.isSidebarCollapsed = collapsed;
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(collapsed));
    } catch (e) {
      console.warn('Failed to save sidebar collapsed state:', e);
    }
    emitChange();
  };

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed(!state.isSidebarCollapsed);
  };

  const togglePinCondition = (conditionId: string) => {
    const exists = state.pinnedConditionIds.includes(conditionId);
    const next = exists
      ? state.pinnedConditionIds.filter(id => id !== conditionId)
      : [conditionId, ...state.pinnedConditionIds];
    state.pinnedConditionIds = next;
    try {
      localStorage.setItem(PINNED_CONDITIONS_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Failed to save pinned conditions:', e);
    }
    emitChange();
  };

  const isConditionPinned = (conditionId: string) => {
    return state.pinnedConditionIds.includes(conditionId);
  };

  const addRecentCondition = (conditionId: string) => {
    if (!conditionId) return;
    const filtered = state.recentConditionIds.filter(id => id !== conditionId);
    const next = [conditionId, ...filtered].slice(0, 10);
    state.recentConditionIds = next;
    try {
      localStorage.setItem(RECENT_CONDITIONS_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Failed to save recent conditions:', e);
    }
    emitChange();
  };

  const setTheme = (theme: AppTheme) => {
    state.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.warn('Failed to save theme:', e);
    }
    applyThemeToDOM(theme);
    emitChange();
  };

  const cycleTheme = () => {
    const order: AppTheme[] = ['dark', 'light', 'system'];
    const nextIndex = (order.indexOf(state.theme) + 1) % order.length;
    setTheme(order[nextIndex]);
  };

  const setDataStatusOpen = (open: boolean) => {
    state.isDataStatusOpen = open;
    emitChange();
  };

  return {
    isMobileDrawerOpen: state.isMobileDrawerOpen,
    isSidebarCollapsed: state.isSidebarCollapsed,
    pinnedConditionIds: state.pinnedConditionIds,
    recentConditionIds: state.recentConditionIds,
    theme: state.theme,
    isDataStatusOpen: state.isDataStatusOpen,
    setMobileDrawerOpen,
    toggleMobileDrawer,
    setSidebarCollapsed,
    toggleSidebarCollapsed,
    togglePinCondition,
    isConditionPinned,
    addRecentCondition,
    setTheme,
    cycleTheme,
    setDataStatusOpen
  };
}

export function applyThemeToDOM(theme: AppTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}
