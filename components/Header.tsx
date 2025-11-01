
import React from 'react';
import { BrainCircuitIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-dark-surface shadow-md">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center">
        <BrainCircuitIcon className="w-8 h-8 mr-3 text-brand-blue" />
        <h1 className="text-2xl font-bold tracking-tight text-white">
          TextRefiner <span className="text-brand-blue">AI</span>
        </h1>
      </div>
    </header>
  );
};
