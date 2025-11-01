export type ChartStyle = 'professional' | 'creative' | 'minimalist';
export type ChartType = 'automatic' | 'bar' | 'line' | 'pie';

export interface Options {
  isAcademic: boolean;
  maintainTone: boolean;
  expand: boolean;
  verifyAccuracy: boolean;
  addCharts: boolean;
  chartType: ChartType;
}

export interface ChartData {
  title: string;
  type: 'bar' | 'line' | 'pie';
  data: Record<string, string | number>[];
  dataKey: string;
  nameKey: string;
}

export interface RefinedTextResponse {
  refinedText: string;
  revisionSummary: string[];
  accuracyReport: string;
  chartSuggestions?: ChartData[];
}