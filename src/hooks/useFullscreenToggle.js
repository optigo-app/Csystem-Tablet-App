import { useCallback, useEffect, useState } from "react";

export const useFullscreenToggle = () => {
  const [isFullscreen, setIsFullscreen] = useState(() => {
    try {
      return sessionStorage.getItem("isFullScreenMode") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem("isFullScreenMode", String(isFullscreen));
    } catch {
      // noop for SSR or restricted mode
    }
  }, [isFullscreen]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const enableFullscreen = useCallback(() => setIsFullscreen(true), []);
  const disableFullscreen = useCallback(() => setIsFullscreen(false), []);

  return { isFullscreen, toggleFullscreen, enableFullscreen, disableFullscreen };
};
