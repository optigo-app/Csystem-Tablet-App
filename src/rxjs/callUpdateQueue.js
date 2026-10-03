import { Subject } from "rxjs";

// RxJS Subject to manage queued priority, status, and estatus updates
export const statusPriorityUpdates$ = new Subject();
