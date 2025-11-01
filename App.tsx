import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { OptionsPanel } from './components/OptionsPanel';
import { OutputDisplay } from './components/OutputDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { BrainCircuitIcon } from './components/icons';
import type { Options, RefinedTextResponse, ChartData } from './types';
import { refineText } from './services/geminiService';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [options, setOptions] = useState<Options>({
    isAcademic: false,
    maintainTone: true,
    expand: true,
    verifyAccuracy: false,
    addCharts: false,
    chartType: 'automatic',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<RefinedTextResponse | null>(null);

  const handleRefine = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to refine.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setOutput(null);

    try {
      const result = await refineText(inputText, options);
      setOutput(result);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred. Please check the console for details.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="flex flex-col gap-6">
          <div className="bg-dark-surface rounded-xl shadow-lg p-6 flex flex-col h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-200">Your Text</h2>
            <div className="relative flex-grow">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your text here (up to 5000 words or more)..."
                className="w-full h-full min-h-[300px] bg-gray-800 border-2 border-dark-border rounded-lg p-4 resize-y focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition duration-200"
                disabled={isLoading}
              />
              <div className="absolute bottom-3 right-3 text-sm text-dark-text-secondary bg-gray-800/80 px-2 py-1 rounded">
                {wordCount} words
              </div>
            </div>
          </div>
          <OptionsPanel options={options} setOptions={setOptions} disabled={isLoading} />
        </div>

        <div className="flex flex-col">
          {isLoading ? (
            <div className="flex-grow flex items-center justify-center bg-dark-surface rounded-xl shadow-lg p-6">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="flex-grow flex items-center justify-center bg-dark-surface rounded-xl shadow-lg p-6 text-red-400">
              <p>{error}</p>
            </div>
          ) : output ? (
            <OutputDisplay output={output} chartStyle="professional" />
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center bg-dark-surface rounded-xl shadow-lg p-6 text-center">
              <BrainCircuitIcon className="w-24 h-24 text-brand-blue mb-4" />
              <h2 className="text-2xl font-bold mb-2">Refined Output</h2>
              <p className="text-dark-text-secondary max-w-sm">Your corrected, verified, and expanded text will appear here once you process it.</p>
            </div>
          )}
        </div>
      </main>
      
      <footer className="sticky bottom-0 bg-dark-bg/80 backdrop-blur-sm p-4 border-t border-dark-border">
        <div className="container mx-auto flex justify-center">
            <button
                onClick={handleRefine}
                disabled={isLoading || !inputText.trim()}
                className="w-full md:w-auto bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold py-3 px-12 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
                {isLoading ? 'Refining...' : 'Refine Text'}
            </button>
        </div>
      </footer>
    </div>
  );
};

export default App;