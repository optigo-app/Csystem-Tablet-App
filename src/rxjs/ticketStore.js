import { BehaviorSubject, combineLatest } from "rxjs";
import { map, distinctUntilChanged, debounceTime } from "rxjs/operators";
import { useSyncExternalStore } from "react";
import { getFilteredTickets, getDateFieldByType, getTicketAgeCategory } from "../utils/TicketListUtils";
import { filterTickets } from "../utils/TicketFilter";

// ─── Ticket Store ─────────────────────────────────────────────────────────────

/**
 * All tickets from server
 * @type {BehaviorSubject<Array>}
 */
export const ticketRawList$ = new BehaviorSubject([]);

/**
 * Active sidebar tab (all | new_ticket | open_ticket | closed_ticket | isSuggested | all_age | Today | 1d | 2d | 1w | 1m | 1y)
 * @type {BehaviorSubject<string>}
 */
export const ticketActiveTab$ = new BehaviorSubject(
	(() => {
		try {
			return JSON.parse(localStorage.getItem("activeItem") || '"all"');
		} catch {
			return "all";
		}
	})()
);

ticketActiveTab$.subscribe((tab) => {
	try {
		localStorage.setItem("activeItem", JSON.stringify(tab));
	} catch {}
});

/**
 * Ages-based sort field
 * @type {BehaviorSubject<string>}
 */
export const ticketAgesFilter$ = new BehaviorSubject(
	(() => {
		try {
			return JSON.parse(sessionStorage.getItem("AgesBasedFilter") || '"latestComment"');
		} catch {
			return "latestComment";
		}
	})()
);

ticketAgesFilter$.subscribe((val) => {
	try {
		sessionStorage.setItem("AgesBasedFilter", JSON.stringify(val));
	} catch {}
});

// ─── URL Filters State ────────────────────────────────────────────────────────

/** @type {import('../hooks/useFilters').Filters} */
const DEFAULT_FILTERS = {
	projectCode: "",
	status: [],
	isStarred: false,
	priority: "",
	followup: "",
	searchQuery: "",
	category: "",
	appname: "",
	mentions: [],
	mentionedBy: [],
};

/**
 * Active URL-synced filter state
 * @type {BehaviorSubject<import('../hooks/useFilters').Filters>}
 */
export const ticketFilters$ = new BehaviorSubject({ ...DEFAULT_FILTERS });

// ─── Derived: Single-pass Sidebar Counts ─────────────────────────────────────

/**
 * Computed in ONE pass: all 12 sidebar tab counts
 * Avoids 12× separate loops each doing JSON.parse(comments) on all tickets
 * @type {BehaviorSubject<Object>}
 */
const ZERO_COUNTS = {
	all: 0, new_ticket: 0, open_ticket: 0, closed_ticket: 0, isSuggested: 0,
	all_age: 0, Today: 0, "1d": 0, "2d": 0, "1w": 0, "1m": 0, "1y": 0,
};

export const ticketSidebarCounts$ = new BehaviorSubject({ ...ZERO_COUNTS });

// Subscribe to ticket list + ages filter to compute all counts in one pass
combineLatest([ticketRawList$, ticketAgesFilter$])
	.pipe(
		debounceTime(0), // batch microtask flush — prevents cascades on same tick
		map(([tickets, filterType]) => {
			if (!tickets?.length) {
				return { ...ZERO_COUNTS };
			}

			// Parse all dates & comments ONCE per ticket, use results for all categories
			const counts = {
				all: tickets.length,
				all_age: 0,
				new_ticket: 0,
				open_ticket: 0,
				closed_ticket: 0,
				isSuggested: 0,
				Today: 0,
				"1d": 0,
				"2d": 0,
				"1w": 0,
				"1m": 0,
				"1y": 0,
			};

			const excludedStatuses = ["closed", "delivered"];

			for (const t of tickets) {
				if (!t) continue;
				const status = (t.Status || "").toLowerCase();

				// View tab counts — use same logic as TicketListUtils.getFilteredTickets
				if (!t?.UpdatedAt?.trim()) counts.new_ticket++;
				if (t?.UpdatedAt?.trim() && !excludedStatuses.includes(status)) counts.open_ticket++;
				if (status === "closed") counts.closed_ticket++;
				if (t.isSuggested === true || t.isSuggested === "True" || t.isSuggested === "true") counts.isSuggested++;

				// Age counts — getTicketAgeCategory returns: "Today"|"1 day"|"2 days"|"1 week"|"1 month"|"1 year+"|""
				const dateField = getDateFieldByType(t, filterType);
				if (dateField) {
					counts.all_age++;
					const age = getTicketAgeCategory(dateField);
					if (age === "Today") counts["Today"]++;
					else if (age === "1 day") counts["1d"]++;
					else if (age === "2 days") counts["2d"]++;
					else if (age === "1 week") counts["1w"]++;
					else if (age === "1 month") counts["1m"]++;
					else if (age === "1 year+") counts["1y"]++;
				}
			}

			return counts;
		}),
		distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
	)
	.subscribe((counts) => ticketSidebarCounts$.next(counts));

// ─── Derived: Filtered Ticket List for Display ────────────────────────────────

/**
 * The final filtered, sorted ticket list to render in TicketList
 * Derived from: raw tickets + active tab + ages filter + URL filters
 * @type {BehaviorSubject<Array>}
 */
export const ticketDisplayList$ = new BehaviorSubject([]);

combineLatest([ticketRawList$, ticketActiveTab$, ticketAgesFilter$, ticketFilters$])
	.pipe(
		debounceTime(0),
		map(([tickets, activeTab, agesFilter, filters]) => {
			// When searching: bypass tab filter, search all tickets
			const baseList = filters?.searchQuery?.trim()
				? tickets || []
				: getFilteredTickets(activeTab, tickets, agesFilter);

			return filterTickets(baseList, filters);
		})
	)
	.subscribe((list) => ticketDisplayList$.next(list));

// ─── Actions ──────────────────────────────────────────────────────────────────

export const setTicketRawList = (tickets) => ticketRawList$.next(tickets);
export const setTicketActiveTab = (tab) => ticketActiveTab$.next(tab);
export const setTicketAgesFilter = (filter) => ticketAgesFilter$.next(filter);
// setTicketFilters replaces the entire filter object (callers from useUrlFilters pass the complete object)
export const setTicketFilters = (newFilters) => {
	ticketFilters$.next({ ...DEFAULT_FILTERS, ...newFilters });
};
export const clearTicketFilters = () => ticketFilters$.next({ ...DEFAULT_FILTERS });

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Subscribe to any BehaviorSubject using useSyncExternalStore (React 18 optimised)
 * @template T
 * @param {BehaviorSubject<T>} subject$
 * @returns {T}
 */
export function useSubjectValue(subject$) {
	return useSyncExternalStore(
		(callback) => {
			const sub = subject$.subscribe(callback);
			return () => sub.unsubscribe();
		},
		() => subject$.getValue()
	);
}
