import { useState, useEffect } from "react";

export const useMultiToggle = (initialState = {}) => {
	const [toggles, setToggles] = useState(initialState);

	const toggle = (key) => {
		setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	return [toggles, toggle];
};
