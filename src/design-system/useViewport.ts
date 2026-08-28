import React, { useState, useEffect } from 'react';
import { BREAKPOINTS } from './tokens';

export type ViewportMode = 'MOBILE' | 'TABLET' | 'LAPTOP' | 'DESKTOP' | 'TV';

export interface ViewportState {
  width: number;
  height: number;
  mode: ViewportMode;
  orientation: 'portrait' | 'landscape';
  isMobile: boolean;
  isTablet: boolean;
  isLaptop: boolean;
  isDesktop: boolean;
  isTV: boolean;
  hasTouch: boolean;
  hasHover: boolean;
}

export function useViewport(): ViewportState {
  const [state, setState] = useState<ViewportState>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    mode: 'LAPTOP',
    orientation: 'landscape',
    isMobile: false,
    isTablet: false,
    isLaptop: true,
    isDesktop: false,
    isTV: false,
    hasTouch: false,
    hasHover: true,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const orientation = w > h ? 'landscape' : 'portrait';
      
      let mode: ViewportMode = 'LAPTOP';
      if (w < BREAKPOINTS.MOBILE) mode = 'MOBILE';
      else if (w < BREAKPOINTS.TABLET) mode = 'TABLET';
      else if (w < BREAKPOINTS.LAPTOP) mode = 'LAPTOP';
      else if (w < BREAKPOINTS.WIDE_DESKTOP) mode = 'DESKTOP';
      else mode = 'TV';

      setState({
        width: w,
        height: h,
        mode,
        orientation,
        isMobile: w < BREAKPOINTS.MOBILE,
        isTablet: w >= BREAKPOINTS.MOBILE && w < BREAKPOINTS.TABLET,
        isLaptop: w >= BREAKPOINTS.TABLET && w < BREAKPOINTS.LAPTOP,
        isDesktop: w >= BREAKPOINTS.LAPTOP && w < BREAKPOINTS.WIDE_DESKTOP,
        isTV: w >= BREAKPOINTS.WIDE_DESKTOP,
        hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        hasHover: window.matchMedia('(hover: hover)').matches,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
}
