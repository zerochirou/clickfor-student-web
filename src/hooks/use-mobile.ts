import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

// Perbaikan: Ubah nama fungsi menjadi useIsMobile
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT;
    }
    return false;
  });

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => {
      setIsMobile(mql.matches);
    };

    mql.addEventListener('change', onChange);

    if (isMobile !== mql.matches) {
      onChange();
    }

    return () => mql.removeEventListener('change', onChange);
  }, [isMobile]);

  return !!isMobile;
}
