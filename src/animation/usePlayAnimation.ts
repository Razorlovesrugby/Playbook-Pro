import { useState } from 'react';
import type { PlayData, OptionNumber } from '../types';
import type { SpeedKey } from './config';

interface UseAnimationProps {
  play: PlayData;
  initialStep?: number;
  initialSpeed?: SpeedKey;
}

export interface UseAnimationReturn {
  currentStep: number;
  isPlaying: boolean;
  activeOptions: OptionNumber[];
  speed: SpeedKey;
  play: () => void;
  pause: () => void;
  reset: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (n: number) => void;
  setActiveOptions: (opts: OptionNumber[]) => void;
  setSpeed: (s: SpeedKey) => void;
  setCurrentStep: (n: number) => void;
  setIsPlaying: (v: boolean) => void;
}

export function usePlayAnimation({
  play: playData,
  initialStep = 0,
  initialSpeed = '1x',
}: UseAnimationProps): UseAnimationReturn {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeOptions, setActiveOptions] = useState<OptionNumber[]>([1, 2, 3]);
  const [speed, setSpeed] = useState<SpeedKey>(initialSpeed);

  return {
    currentStep,
    isPlaying,
    activeOptions,
    speed,
    play:  () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    reset: () => { setIsPlaying(false); setCurrentStep(0); },
    nextStep: () => {
      setIsPlaying(false);
      setCurrentStep(s => Math.min(s + 1, playData.steps.length - 1));
    },
    prevStep: () => {
      setIsPlaying(false);
      setCurrentStep(s => Math.max(s - 1, 0));
    },
    goToStep: (n: number) => {
      setIsPlaying(false);
      setCurrentStep(Math.max(0, Math.min(n, playData.steps.length - 1)));
    },
    setActiveOptions,
    setSpeed,
    setCurrentStep,
    setIsPlaying,
  };
}
