
// FIX: Add AppMode enum as it was missing and is used in ModeSelector.tsx
export enum AppMode {
  BANK = 'BANK',
  IMAGE = 'IMAGE',
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}
