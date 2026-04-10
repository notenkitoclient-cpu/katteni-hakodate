import { useState } from 'react';
import { ScrollyContext } from './ScrollyContext';

interface Props {
  children: React.ReactNode;
}

export default function ScrollySection({ children }: Props) {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <ScrollyContext.Provider value={{ currentStep, setCurrentStep }}>
      <div style={{ position: 'relative' }}>
        {children}
      </div>
    </ScrollyContext.Provider>
  );
}
