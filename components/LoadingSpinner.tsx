
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-dark-border border-t-brand-blue rounded-full animate-spin"></div>
      <p className="text-lg text-dark-text-secondary">AI is refining your text...</p>
    </div>
  );
};
