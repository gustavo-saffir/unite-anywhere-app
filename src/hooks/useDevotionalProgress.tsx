import { useState, useEffect } from 'react';

interface DevotionalProgress {
  step: number;
  reflection: string;
  application: string;
  memorization: string;
  memorizationValidated: boolean;
  memorizationScore: number;
  fontSize: 'small' | 'medium' | 'large';
  isDarkMode: boolean;
  devotionalId: string;
  date: string;
}

export const useDevotionalProgress = (devotionalId: string | undefined) => {
  const STORAGE_KEY = 'devotional_progress';
  const today = new Date().toISOString().split('T')[0];

  const getInitialProgress = (): Partial<DevotionalProgress> => {
    if (!devotionalId) return {};
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return {};
      
      const progress: DevotionalProgress = JSON.parse(saved);
      
      // Só restaura se for o mesmo devocional e do mesmo dia
      if (progress.devotionalId === devotionalId && progress.date === today) {
        return progress;
      }
      
      // Se é outro devocional ou outro dia, limpa o storage
      localStorage.removeItem(STORAGE_KEY);
      return {};
    } catch (error) {
      console.error('Error loading progress:', error);
      localStorage.removeItem(STORAGE_KEY);
      return {};
    }
  };

  const initialProgress = getInitialProgress();

  const [step, setStep] = useState(initialProgress.step || 1);
  const [reflection, setReflection] = useState(initialProgress.reflection || '');
  const [application, setApplication] = useState(initialProgress.application || '');
  const [memorization, setMemorization] = useState(initialProgress.memorization || '');
  const [memorizationValidated, setMemorizationValidated] = useState(initialProgress.memorizationValidated || false);
  const [memorizationScore, setMemorizationScore] = useState(initialProgress.memorizationScore || 0);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(initialProgress.fontSize || 'medium');
  const [isDarkMode, setIsDarkMode] = useState(initialProgress.isDarkMode || false);

  // Auto-save progress whenever any state changes
  useEffect(() => {
    if (!devotionalId) return;

    const progress: DevotionalProgress = {
      step,
      reflection,
      application,
      memorization,
      memorizationValidated,
      memorizationScore,
      fontSize,
      isDarkMode,
      devotionalId,
      date: today,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [
    step,
    reflection,
    application,
    memorization,
    memorizationValidated,
    memorizationScore,
    fontSize,
    isDarkMode,
    devotionalId,
    today,
  ]);

  const clearProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    step,
    setStep,
    reflection,
    setReflection,
    application,
    setApplication,
    memorization,
    setMemorization,
    memorizationValidated,
    setMemorizationValidated,
    memorizationScore,
    setMemorizationScore,
    fontSize,
    setFontSize,
    isDarkMode,
    setIsDarkMode,
    clearProgress,
  };
};
