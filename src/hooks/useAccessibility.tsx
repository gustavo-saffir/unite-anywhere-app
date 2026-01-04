import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type FontSize = 'small' | 'medium' | 'large';

interface AccessibilityContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  fontSizeClass: string;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEY = 'app-accessibility';

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.fontSize || 'medium';
        } catch {
          return 'medium';
        }
      }
    }
    return 'medium';
  });

  const fontSizeClasses: Record<FontSize, string> = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
  };

  const increaseFontSize = () => {
    if (fontSize === 'small') setFontSizeState('medium');
    else if (fontSize === 'medium') setFontSizeState('large');
  };

  const decreaseFontSize = () => {
    if (fontSize === 'large') setFontSizeState('medium');
    else if (fontSize === 'medium') setFontSizeState('small');
  };

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ fontSize }));
  }, [fontSize]);

  // Apply font size to document root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    root.classList.add(fontSizeClasses[fontSize]);
  }, [fontSize]);

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        increaseFontSize,
        decreaseFontSize,
        fontSizeClass: fontSizeClasses[fontSize]
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
