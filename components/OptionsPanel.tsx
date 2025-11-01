import React from 'react';
import type { Options, ChartType } from '../types';
import { AcademicCapIcon, ChatBubbleBottomCenterTextIcon, ArrowsPointingOutIcon, CheckBadgeIcon, ChartBarIcon } from './icons';

interface OptionsPanelProps {
  options: Options;
  setOptions: React.Dispatch<React.SetStateAction<Options>>;
  disabled: boolean;
}

const OptionCheckbox: React.FC<{
  id: keyof Options;
  label: string;
  checked: boolean;
  onChange: (id: keyof Options, checked: boolean) => void;
  disabled: boolean;
  icon: React.ReactNode;
}> = ({ id, label, checked, onChange, disabled, icon }) => (
    <label htmlFor={id} className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${checked ? 'bg-blue-900/50 border-brand-blue' : 'bg-gray-800 border-dark-border hover:border-gray-600'}`}>
        <div className="mr-4 text-brand-blue">{icon}</div>
        <span className="flex-grow text-gray-300 font-medium">{label}</span>
        <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(id, e.target.checked)}
            disabled={disabled}
            className="form-checkbox h-5 w-5 text-brand-blue bg-gray-700 border-gray-600 rounded focus:ring-brand-blue"
        />
    </label>
);

const ChartTypeButton: React.FC<{
  label: string;
  value: ChartType;
  current: ChartType;
  onClick: (value: ChartType) => void;
  disabled: boolean;
}> = ({ label, value, current, onClick, disabled }) => (
  <button
    type="button"
    onClick={() => onClick(value)}
    disabled={disabled}
    className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
      current === value
        ? 'bg-brand-blue text-white'
        : 'bg-gray-700 text-dark-text-secondary hover:bg-gray-600'
    } disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {label}
  </button>
);


export const OptionsPanel: React.FC<OptionsPanelProps> = ({ options, setOptions, disabled }) => {

  const handleChange = (id: keyof Options, checked: boolean) => {
    setOptions(prev => {
      const newOptions = { ...prev, [id]: checked };
      if (id === 'isAcademic' && checked) {
        newOptions.maintainTone = false;
      }
      if (id === 'maintainTone' && checked) {
        newOptions.isAcademic = false;
      }
      return newOptions;
    });
  };
  
  const handleTypeChange = (type: ChartType) => {
    setOptions(prev => ({ ...prev, chartType: type }));
  };

  return (
    <div className="bg-dark-surface rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-200">Processing Options</h2>
      <div className="space-y-4">
        <OptionCheckbox
            id="isAcademic"
            label="Correct & Rewrite in Academic Style"
            checked={options.isAcademic}
            onChange={handleChange}
            disabled={disabled}
            icon={<AcademicCapIcon className="w-6 h-6" />}
        />
        <OptionCheckbox
            id="maintainTone"
            label="Maintain Original Narrative Tone"
            checked={options.maintainTone}
            onChange={handleChange}
            disabled={disabled}
            icon={<ChatBubbleBottomCenterTextIcon className="w-6 h-6" />}
        />
        <OptionCheckbox
            id="expand"
            label="Expand by 20%"
            checked={options.expand}
            onChange={handleChange}
            disabled={disabled}
            icon={<ArrowsPointingOutIcon className="w-6 h-6" />}
        />
        <OptionCheckbox
            id="verifyAccuracy"
            label="Verify Historical / Scientific Accuracy"
            checked={options.verifyAccuracy}
            onChange={handleChange}
            disabled={disabled}
            icon={<CheckBadgeIcon className="w-6 h-6" />}
        />
        <div>
          <OptionCheckbox
              id="addCharts"
              label="Suggest charts for data"
              checked={options.addCharts}
              onChange={handleChange}
              disabled={disabled}
              icon={<ChartBarIcon className="w-6 h-6" />}
          />
          {options.addCharts && (
            <div className="pl-12 pt-3 -mt-2">
                <h3 className="text-sm font-medium text-dark-text-secondary mb-2">Tipo di Grafico</h3>
                <div className="flex gap-2 flex-wrap">
                    <ChartTypeButton
                        label="Automatico"
                        value="automatic"
                        current={options.chartType}
                        onClick={handleTypeChange}
                        disabled={disabled}
                    />
                    <ChartTypeButton
                        label="Grafico a Barre"
                        value="bar"
                        current={options.chartType}
                        onClick={handleTypeChange}
                        disabled={disabled}
                    />
                    <ChartTypeButton
                        label="Grafico a Linee"
                        value="line"
                        current={options.chartType}
                        onClick={handleTypeChange}
                        disabled={disabled}
                    />
                    <ChartTypeButton
                        label="Grafico a Torta"
                        value="pie"
                        current={options.chartType}
                        onClick={handleTypeChange}
                        disabled={disabled}
                    />
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};