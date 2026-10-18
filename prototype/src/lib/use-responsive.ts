"use client";
import { useState, useEffect } from "react";

export interface ResponsiveState {
  isMobile: boolean;       // < 768px
  isSmallMobile: boolean;  // < 480px
  isTablet: boolean;       // >= 768px && < 1024px
  isDesktop: boolean;      // >= 1024px
  width: number;
  height: number;
  isMounted: boolean;
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isSmallMobile: false,
    isTablet: false,
    isDesktop: true,
    width: 1200,
    height: 800,
    isMounted: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setState({
        isMobile: width < 768,
        isSmallMobile: width < 480,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
        height,
        isMounted: true,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return state;
}
