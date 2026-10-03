/**
 * @typedef {Object} Filters
 * @property {string} projectCode
 * @property {string[]} status
 * @property {boolean} isStarred
 * @property {string} priority
 * @property {string} followup
 * @property {string} searchQuery
 * @property {string} category
 * @property {string} appname
 * @property {string[]} mentions
 * @property {string[]} mentionedBy
 */

/**
 * @typedef {Object} UseUrlFiltersResult
 * @property {Filters} filters - Current active filters from the URL.
 * @property {(updates: Partial<Filters>) => void} updateFilters - Updates filters and syncs with the URL.
 * @property {() => void} clearFilters - Clears all filters and resets the URL.
 * @property {boolean} hasFilters - True if any filter is currently applied.
 *  * @property {number} filterCount

 */

import { useEffect, useState, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import qs from "qs";

/** @type {Filters} */
const defaultFilters = {
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

// Only keep values that are truly meaningful
const isNotEmpty = (val) => {
	if (Array.isArray(val)) return val.length > 0;
	if (typeof val === "boolean") return val === true;
	return val !== "" && val != null;
};

/**
 * @returns {UseUrlFiltersResult}
 */
export const useUrlFilters = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [filters, setFilters] = useState(defaultFilters);
	const debounceTimer = useRef();

	// Load filters from URL on initial mount or URL change
	useEffect(() => {
		const query = qs.parse(location?.search, { ignoreQueryPrefix: true });

		/** @type {Filters} */
		const parsedFilters = {
			projectCode: query?.projectCode || "",
			status: typeof query?.status === "string" ? query?.status?.split(",") : [],
			isStarred: query?.isStarred === "true",
			priority: query?.priority || "",
			followup: query?.followup || "",
			searchQuery: query?.searchQuery || "",
			category: query?.category || "",
			appname: query?.appname || "",
			mentions: typeof query?.mentions === "string" ? query?.mentions?.split(",").filter(Boolean) : Array.isArray(query?.mentions) ? query?.mentions.filter(Boolean) : [],
			mentionedBy: typeof query?.mentionedBy === "string" ? query?.mentionedBy?.split(",").filter(Boolean) : Array.isArray(query?.mentionedBy) ? query?.mentionedBy.filter(Boolean) : [],
		};

		setFilters(parsedFilters);
	}, [location.search]);

	/**
	 * Updates filter values and syncs to the URL (debounced).
	 * @param {Partial<Filters>} updates
	 */
	const updateFilters = (updates) => {
		const newFilters = { ...filters, ...updates };
		setFilters(newFilters);

		clearTimeout(debounceTimer.current);
		debounceTimer.current = setTimeout(() => {
			const query = {};

			Object?.entries(newFilters)?.forEach(([key, value]) => {
				if (isNotEmpty(value)) {
					query[key] = Array?.isArray(value) ? value?.join(",") : value;
				}
			});

			const search = qs?.stringify(query, {
				addQueryPrefix: true,
				skipNulls: true,
			});
			navigate({ search }, { replace: true });
		}, 100);
	};

	/**
	 * Clears all filters and resets the URL.
	 */
	const clearFilters = () => {
		setFilters(defaultFilters);
		navigate({ search: "" }, { replace: true });
	};

	/**
	 * Check if any filter is active
	 * @type {boolean}
	 */
	const hasFilters = useMemo(() => {
		return Object?.values(filters)?.some(isNotEmpty);
	}, [filters]);

	const filterCount = useMemo(() => {
		return Object?.values(filters)?.filter(isNotEmpty)?.length;
	}, [filters]);

	return { filters, updateFilters, clearFilters, hasFilters, filterCount };
};
