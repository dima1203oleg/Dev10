import React, { useState, useEffect } from 'react';
import { BREAKPOINTS } from './tokens';

export type ViewportMode = 'MOBILE' | 'TABLET' | 'LAPTOP' | 'DESKTOP' | 'TV';

export function useViewport() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getMode = (): ViewportMode => {
    if (width < BREAKPOINTS.MOBILE) return 'MOBILE';
    if (width < BREAKPOINTS.TABLET) return 'TABLET';
    if (width < BREAKPOINTS.LAPTOP) return 'LAPTOP';
    if (width < BREAKPOINTS.WIDE_DESKTOP) return 'DESKTOP';
    return 'TV';
  };

  return {
    width,
    mode: getMode(),
    isMobile: width < BREAKPOINTS.MOBILE,
    isTablet: width >= BREAKPOINTS.MOBILE && width < BREAKPOINTS.TABLET,
    isLaptop: width >= BREAKPOINTS.TABLET && width < BREAKPOINTS.LAPTOP,
    isDesktop: width >= BREAKPOINTS.LAPTOP && width < BREAKPOINTS.WIDE_DESKTOP,
    isTV: width >= BREAKPOINTS.WIDE_DESKTOP,
  };
}
