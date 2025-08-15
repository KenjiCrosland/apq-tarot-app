import { ref, onMounted, onBeforeUnmount } from 'vue';
import { debounce } from 'lodash-es';

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl';

interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

const DEFAULT_BREAKPOINTS: BreakpointConfig = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1440,
};

export function useBreakpoint(customBreakpoints?: Partial<BreakpointConfig>) {
  const breakpoints = { ...DEFAULT_BREAKPOINTS, ...customBreakpoints };
  const breakpoint = ref<Breakpoint>('lg');
  const windowWidth = ref(0);
  const windowHeight = ref(0);

  function updateBreakpoint() {
    const width = window.innerWidth;
    windowWidth.value = width;
    windowHeight.value = window.innerHeight;

    if (width < breakpoints.sm) {
      breakpoint.value = 'sm';
    } else if (width < breakpoints.md) {
      breakpoint.value = 'md';
    } else if (width < breakpoints.lg) {
      breakpoint.value = 'lg';
    } else {
      breakpoint.value = 'xl';
    }
  }

  const debouncedUpdate = debounce(updateBreakpoint, 150);

  onMounted(() => {
    updateBreakpoint();
    window.addEventListener('resize', debouncedUpdate);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', debouncedUpdate);
    debouncedUpdate.cancel();
  });

  return {
    breakpoint,
    windowWidth,
    windowHeight,
    isSmall: () => breakpoint.value === 'sm',
    isMedium: () => breakpoint.value === 'md',
    isLarge: () => breakpoint.value === 'lg',
    isExtraLarge: () => breakpoint.value === 'xl',
    isMobile: () => ['sm', 'md'].includes(breakpoint.value),
    isDesktop: () => ['lg', 'xl'].includes(breakpoint.value),
  };
}
