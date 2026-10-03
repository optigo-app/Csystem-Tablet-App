import { BehaviorSubject } from "rxjs";
import { useSyncExternalStore } from "react";

const SLIDERS_KEY = "call_sliders_state";

const getSavedSliders = () => {
  try {
    const saved = localStorage.getItem(SLIDERS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (err) {
    console.error("Error reading saved sliders:", err);
    return {};
  }
};

// 1. BehaviorSubjects for Layout states
export const isAnalysis$ = new BehaviorSubject(false);
export const followUpMode$ = new BehaviorSubject(getSavedSliders().followUpMode === true);

// 2. Automatically sync followUpMode changes back to localStorage
followUpMode$.subscribe((isOpen) => {
  try {
    const saved = getSavedSliders();
    if (saved.followUpMode !== isOpen) {
      saved.followUpMode = isOpen;
      localStorage.setItem(SLIDERS_KEY, JSON.stringify(saved));
    }
  } catch (err) {
    console.error("Error syncing sliders to localStorage:", err);
  }
});

// 3. Actions to toggle panel states
export const toggleAnalysis = (forceState = null) => {
  isAnalysis$.next(forceState !== null ? forceState : !isAnalysis$.value);
};

export const toggleFollowUpMode = (forceState = null) => {
  followUpMode$.next(forceState !== null ? forceState : !followUpMode$.value);
};

// --- Ticket UI Layout States ---
const TICKET_SIDEBAR_KEY = "ticket_sidebar_collapsed";
const getSavedTicketSidebar = () => {
  try {
    const saved = localStorage.getItem(TICKET_SIDEBAR_KEY);
    return saved ? JSON.parse(saved) === true : false;
  } catch (err) {
    return false;
  }
};

export const ticketSidebarCollapsed$ = new BehaviorSubject(getSavedTicketSidebar());

ticketSidebarCollapsed$.subscribe((isCollapsed) => {
  try {
    localStorage.setItem(TICKET_SIDEBAR_KEY, JSON.stringify(isCollapsed));
  } catch (err) {
    console.error("Error syncing ticket sidebar to localStorage:", err);
  }
});

export const toggleTicketSidebar = (forceState = null) => {
  ticketSidebarCollapsed$.next(forceState !== null ? forceState : !ticketSidebarCollapsed$.value);
};

// --- Main Sidebar UI Layout States ---
const MAIN_SIDEBAR_KEY = "main_sidebar_collapsed";
const getSavedMainSidebar = () => {
  try {
    const saved = localStorage.getItem(MAIN_SIDEBAR_KEY);
    return saved ? JSON.parse(saved) === true : false;
  } catch (err) {
    return false;
  }
};

export const mainSidebarCollapsed$ = new BehaviorSubject(getSavedMainSidebar());

mainSidebarCollapsed$.subscribe((isCollapsed) => {
  try {
    localStorage.setItem(MAIN_SIDEBAR_KEY, JSON.stringify(isCollapsed));
  } catch (err) {
    console.error("Error syncing main sidebar to localStorage:", err);
  }
});

export const toggleMainSidebar = (forceState = null) => {
  mainSidebarCollapsed$.next(forceState !== null ? forceState : !mainSidebarCollapsed$.value);
};

export const ticketFilterAnchorEl$ = new BehaviorSubject(null);

export const openTicketFilter = (anchorEl) => {
  ticketFilterAnchorEl$.next(anchorEl);
};

export const closeTicketFilter = () => {
  ticketFilterAnchorEl$.next(null);
};

// 4. Custom Hook to subscribe to RxJS Subjects in React (optimised React 18 integration)
export function useSubject(subject$) {
  return useSyncExternalStore(
    (callback) => {
      const subscription = subject$.subscribe(callback);
      return () => subscription.unsubscribe();
    },
    () => subject$.getValue()
  );
}
