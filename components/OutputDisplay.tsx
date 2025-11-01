import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import type { RefinedTextResponse, ChartData, ChartStyle } from '../types';
import { downloadTxt, downloadDocx, downloadPdf } from '../utils/fileDownloader';
import { ClipboardDocumentIcon, ArrowDownTrayIcon, DocumentTextIcon, ChartBarIcon, ClipboardDocumentCheckIcon } from './icons';

type Tab = 'text' | 'revisions' | 'charts';

const CHART_PALETTES: Record<ChartStyle, string[]> = {
  professional: ['#3b82f6', '#10b981', '#f97316', '#6366f1', '#ec4899', '#84cc16'],
  creative: ['#8b5cf6', '#ef4444', ' #eab308', '#22c55e', '#06b6d4', '#d946ef'],
  minimalist: ['#6b7280', '#d1d5db', '#4b5563', '#9ca3af', '#f3f4f6', '#e5e7eb'],
};


const ChartRenderer: React.FC<{ chart: ChartData, style: ChartStyle }> = ({ chart, style }) => {
    const { type, data, dataKey, nameKey, title } = chart;
    const colors = CHART_PALETTES[style] || CHART_PALETTES.professional;

    return (
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold">{title}</h4>
            </div>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    {type === 'bar' ? (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey={nameKey} stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                            <Legend />
                            <Bar dataKey={dataKey} fill={colors[0]} />
                        </BarChart>
                    ) : type === 'line' ? (
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey={nameKey} stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                            <Legend />
                            <Line type="monotone" dataKey={dataKey} stroke={colors[0]} />
                        </LineChart>
                    ) : (
                        <PieChart>
                            <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={100} fill={colors[0]} label>
                                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                            <Legend />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

interface OutputDisplayProps {
  output: RefinedTextResponse;
  chartStyle: ChartStyle;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ output, chartStyle }) => {
  const [activeTab, setActiveTab] = useState<Tab>('text');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(output.refinedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const hasCharts = output.chartSuggestions && output.chartSuggestions.length > 0;

  const TabButton: React.FC<{ tabName: Tab, label: string, icon: React.ReactNode, count?: number}> = ({tabName, label, icon, count}) => (
    <button onClick={() => setActiveTab(tabName)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tabName ? 'bg-dark-surface text-brand-blue border-b-2 border-brand-blue' : 'text-dark-text-secondary hover:bg-gray-800'}`}>
        {icon}
        {label}
        {count !== undefined && <span className="ml-1 bg-blue-900 text-brand-blue text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>}
    </button>
  );

  return (
    <div className="bg-dark-surface rounded-xl shadow-lg flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b border-dark-border">
          <div className="flex border-b-2 border-dark-border">
            <TabButton tabName="text" label="Final Text" icon={<DocumentTextIcon className="w-5 h-5" />} />
            <TabButton tabName="revisions" label="Revisions" icon={<ClipboardDocumentCheckIcon className="w-5 h-5" />} count={output.revisionSummary.length} />
            {hasCharts && <TabButton tabName="charts" label="Charts" icon={<ChartBarIcon className="w-5 h-5" />} count={output.chartSuggestions.length}/>}
          </div>
        <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="p-2 rounded-md hover:bg-gray-800 transition-colors" title="Copy to clipboard">
                {copied ? <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-400"/> : <ClipboardDocumentIcon className="w-5 h-5 text-dark-text-secondary" />}
            </button>
            <div className="group relative">
                <button className="p-2 rounded-md hover:bg-gray-800 transition-colors" title="Download">
                    <ArrowDownTrayIcon className="w-5 h-5 text-dark-text-secondary" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-32 bg-gray-800 border border-dark-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible z-10">
                    <button onClick={() => downloadTxt(output.refinedText)} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">.txt</button>
                    <button onClick={() => downloadDocx(output.refinedText)} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">.docx</button>
                    <button onClick={() => downloadPdf(output.refinedText)} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">.pdf</button>
                </div>
            </div>
        </div>
      </div>

      <div className="p-6 overflow-y-auto flex-grow">
        {activeTab === 'text' && (
          <div className="prose prose-invert max-w-none prose-p:text-dark-text prose-headings:text-gray-200">
            <p className="whitespace-pre-wrap">{output.refinedText}</p>
          </div>
        )}
        {activeTab === 'revisions' && (
          <div>
            {output.accuracyReport && (
                <div className="mb-4 bg-blue-900/50 border border-brand-blue text-blue-300 p-3 rounded-lg">
                    <p className="font-semibold">Accuracy Report:</p>
                    <p>{output.accuracyReport}</p>
                </div>
            )}
            <ul className="list-disc list-inside space-y-2">
              {output.revisionSummary.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </div>
        )}
        {activeTab === 'charts' && hasCharts && (
            <div>
                {output.chartSuggestions?.map((chart, index) => <ChartRenderer key={index} chart={chart} style={chartStyle} />)}
            </div>
        )}
      </div>
    </div>
  );
};
