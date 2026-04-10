import { createContext, useContext } from 'react';

interface ScrollyContextValue {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export const ScrollyContext = createContext<ScrollyContextValue>({
  currentStep: 0,
  setCurrentStep: () => {},
});

export function useScrolly() {
  return useContext(ScrollyContext);
}
