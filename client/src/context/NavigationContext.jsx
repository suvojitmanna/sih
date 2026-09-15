import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const location = useLocation();

  // navMode: 'sidebar' | 'topbar' (default: 'sidebar' for modern dashboard layout)
  const [navMode, setNavModeState] = useState(() => {
    const saved = localStorage.getItem("nav_layout_mode");
    return saved === "topbar" || saved === "sidebar" ? saved : "sidebar";
  });

  // isCollapsed: true (mini rail ~72px) | false (full ~260px)
  const [isCollapsed, setIsCollapsedState] = useState(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    return saved === "true";
  });

  // Mobile drawer open/close
  const [mobileOpen, setMobileOpen] = useState(false);

  const setNavMode = (mode) => {
    setNavModeState(mode);
    localStorage.setItem("nav_layout_mode", mode);
  };

  const toggleNavMode = () => {
    const nextMode = navMode === "sidebar" ? "topbar" : "sidebar";
    setNavMode(nextMode);
  };

  const setIsCollapsed = (collapsed) => {
    setIsCollapsedState(collapsed);
    localStorage.setItem("sidebar_collapsed", String(collapsed));
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Synchronize body classes so main page containers adapt automatically (excluding /auth)
  useEffect(() => {
    const root = document.body;
    const isAuthPage = location.pathname === "/auth";

    if (navMode === "sidebar" && !isAuthPage) {
      root.classList.add("layout-mode-sidebar");
      if (isCollapsed) {
        root.classList.add("sidebar-collapsed");
      } else {
        root.classList.remove("sidebar-collapsed");
      }
    } else {
      root.classList.remove("layout-mode-sidebar");
      root.classList.remove("sidebar-collapsed");
    }
  }, [navMode, isCollapsed, location.pathname]);

  return (
    <NavigationContext.Provider
      value={{
        navMode,
        setNavMode,
        toggleNavMode,
        isCollapsed,
        setIsCollapsed,
        toggleCollapse,
        mobileOpen,
        setMobileOpen,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};
