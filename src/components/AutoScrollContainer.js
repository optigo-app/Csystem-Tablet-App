// AutoScrollContainer.js - Continuous smooth vertical auto-scroller with hover-stop & drag/touch detection
import React, { useRef, useEffect, useCallback } from "react";

export default function AutoScrollContainer({ children, speed = 0.22, resumeDelay = 2000, pauseOnHover = true, className = "", style = {} }) {
	const containerRef = useRef(null);
	const isInteractingRef = useRef(false);
	const isHoveredRef = useRef(false);
	const resumeTimerRef = useRef(null);
	const animFrameRef = useRef(null);
	const scrollPosRef = useRef(0);

	const startAutoScroll = useCallback(() => {
		if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

		const step = () => {
			const container = containerRef.current;
			if (container && !isInteractingRef.current && (!pauseOnHover || !isHoveredRef.current)) {
				const maxScroll = container.scrollHeight - container.clientHeight;
				if (maxScroll > 0) {
					scrollPosRef.current += speed;
					if (scrollPosRef.current >= maxScroll - 1) {
						scrollPosRef.current = 0;
						container.scrollTop = 0;
					} else {
						container.scrollTop = scrollPosRef.current;
					}
				}
			} else if (container) {
				scrollPosRef.current = container.scrollTop;
			}
			animFrameRef.current = requestAnimationFrame(step);
		};

		animFrameRef.current = requestAnimationFrame(step);
	}, [speed, pauseOnHover]);

	const stopAutoScroll = useCallback(() => {
		if (animFrameRef.current) {
			cancelAnimationFrame(animFrameRef.current);
			animFrameRef.current = null;
		}
	}, []);

	const handleUserActivity = useCallback(() => {
		isInteractingRef.current = true;
		stopAutoScroll();

		const container = containerRef.current;
		if (container) {
			scrollPosRef.current = container.scrollTop;
		}

		if (resumeTimerRef.current) {
			clearTimeout(resumeTimerRef.current);
		}

		resumeTimerRef.current = setTimeout(() => {
			isInteractingRef.current = false;
			startAutoScroll();
		}, resumeDelay);
	}, [resumeDelay, startAutoScroll, stopAutoScroll]);

	useEffect(() => {
		startAutoScroll();

		const container = containerRef.current;
		if (!container) return;

		// Check if mouse is already hovering on mount
		if (pauseOnHover && container.matches && container.matches(":hover") && (typeof window === "undefined" || !window.matchMedia || window.matchMedia("(hover: hover)").matches)) {
			isHoveredRef.current = true;
		}

		const onMouseEnter = (e) => {
			if (!pauseOnHover) return;
			if (e?.sourceCapabilities?.firesTouchEvents) return;
			if (typeof window !== "undefined" && window.matchMedia && !window.matchMedia("(hover: hover)").matches) {
				return;
			}
			isHoveredRef.current = true;
		};

		const onMouseMove = (e) => {
			if (!pauseOnHover) return;
			if (e?.sourceCapabilities?.firesTouchEvents) return;
			if (typeof window !== "undefined" && window.matchMedia && !window.matchMedia("(hover: hover)").matches) {
				return;
			}
			if (!isHoveredRef.current) {
				isHoveredRef.current = true;
			}
		};

		const onMouseLeave = () => {
			if (!pauseOnHover) return;
			isHoveredRef.current = false;
			if (!isInteractingRef.current && !animFrameRef.current) {
				startAutoScroll();
			}
		};

		const onWheel = () => handleUserActivity();
		const onTouchStart = () => {
			isHoveredRef.current = false;
			handleUserActivity();
		};
		const onTouchMove = () => handleUserActivity();
		const onTouchEnd = () => {
			isHoveredRef.current = false;
		};
		const onMouseDown = () => handleUserActivity();

		container.addEventListener("mouseenter", onMouseEnter);
		container.addEventListener("mousemove", onMouseMove, { passive: true });
		container.addEventListener("mouseleave", onMouseLeave);
		container.addEventListener("wheel", onWheel, { passive: true });
		container.addEventListener("touchstart", onTouchStart, { passive: true });
		container.addEventListener("touchmove", onTouchMove, { passive: true });
		container.addEventListener("touchend", onTouchEnd, { passive: true });
		container.addEventListener("mousedown", onMouseDown, { passive: true });

		return () => {
			stopAutoScroll();
			if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
			container.removeEventListener("mouseenter", onMouseEnter);
			container.removeEventListener("mousemove", onMouseMove);
			container.removeEventListener("mouseleave", onMouseLeave);
			container.removeEventListener("wheel", onWheel);
			container.removeEventListener("touchstart", onTouchStart);
			container.removeEventListener("touchmove", onTouchMove);
			container.removeEventListener("touchend", onTouchEnd);
			container.removeEventListener("mousedown", onMouseDown);
		};
	}, [pauseOnHover, startAutoScroll, stopAutoScroll, handleUserActivity]);

	return (
		<div
			ref={containerRef}
			className={`hide-scrollbar ${className}`}
			onMouseEnter={() => {
				if (pauseOnHover && (typeof window === "undefined" || !window.matchMedia || window.matchMedia("(hover: hover)").matches)) {
					isHoveredRef.current = true;
				}
			}}
			onMouseLeave={() => {
				if (pauseOnHover) {
					isHoveredRef.current = false;
					if (!isInteractingRef.current && !animFrameRef.current) {
						startAutoScroll();
					}
				}
			}}
			style={{
				overflowY: "auto",
				height: "100%",
				width: "100%",
				WebkitOverflowScrolling: "touch",
				...style,
			}}
		>
			{children}
		</div>
	);
}
