import { BehaviorSubject, Subject } from "rxjs";
import { useSyncExternalStore } from "react";

// Emits: { callId } to open, or null to close
export const acceptCallModal$ = new Subject();

// --- Training Form Store ---
// { open: boolean, editValue: object | null }
export const trainingFormStore$ = new BehaviorSubject({ open: false, editValue: null });

export const openTrainingForm = (editValue = null) => {
  trainingFormStore$.next({ open: true, editValue });
};

export const closeTrainingForm = () => {
  trainingFormStore$.next({ open: false, editValue: null });
};

export function useTrainingFormStore() {
  return useSyncExternalStore(
    (callback) => {
      const sub = trainingFormStore$.subscribe(callback);
      return () => sub.unsubscribe();
    },
    () => trainingFormStore$.getValue()
  );
}

// --- Follow-up Edit Popover Store ---
// { open: boolean, type: string | null, fu: object | null, anchorEl: HTMLElement | null }
export const followUpEdit$ = new BehaviorSubject({ open: false, type: null, fu: null, anchorEl: null });

// --- Feedback Popover Store ---
// { anchorEl: HTMLElement | null, data: object | null }
export const feedbackPopover$ = new BehaviorSubject({ anchorEl: null, data: null });

// --- Add Follow-up Modal Store ---
// { open: boolean, row: object | null }
export const addFollowUpModal$ = new BehaviorSubject({ open: false, row: null });

export const openAddFollowUpModal = (row) => {
  addFollowUpModal$.next({ open: true, row });
};

export const closeAddFollowUpModal = () => {
  addFollowUpModal$.next({ open: false, row: null });
};

export function useAddFollowUpModalStore() {
  return useSyncExternalStore(
    (callback) => {
      const sub = addFollowUpModal$.subscribe(callback);
      return () => sub.unsubscribe();
    },
    () => addFollowUpModal$.getValue()
  );
}


