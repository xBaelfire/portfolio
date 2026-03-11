import { useState, useEffect, useCallback } from 'react';

export function useScrollSpy(
  sectionIds: string[],
  offset = 100
): string {
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] ?? '');

  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY + offset;

    let currentSection = sectionIds[0] ?? '';

    for (const id of sectionIds) {
      const element = document.getElementById(id);
      if (!element) continue;

      const sectionTop = element.offsetTop;
      if (scrollPosition >= sectionTop) {
        currentSection = id;
      }
    }

    setActiveSection(currentSection);
  }, [sectionIds, offset]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return activeSection;
}
