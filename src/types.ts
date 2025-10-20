// Color value representation
export interface ColorValue {
  r: number;
  g: number;
  b: number;
  a: number;
}

// Typography value representation
export interface TypographyValue {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number | { value: number; unit: string };
  letterSpacing: number | { value: number; unit: string };
}

// Style suggestion with match information
export interface StyleSuggestion {
  styleId: string;
  styleName: string;
  matchType: 'exact' | 'closest';
  confidence: number;
  styleValue: ColorValue | TypographyValue;
}

// Unconnected element representation
export interface UnconnectedElement {
  id: string;
  name: string;
  type: 'fill' | 'stroke' | 'typography';
  layerPath: string;
  currentValue: ColorValue | TypographyValue;
  suggestions: StyleSuggestion[];
  paintIndex?: number; // For fills/strokes with multiple paints
}

// Message types for communication between plugin and UI
export type MessageToPlugin = 
  | { type: 'analyze' }
  | { type: 'connect-element'; nodeId: string; styleId: string; elementType: 'fill' | 'stroke' | 'typography'; paintIndex?: number }
  | { type: 'create-style'; nodeId: string; elementType: 'fill' | 'stroke' | 'typography'; paintIndex?: number; styleName: string };

export type MessageToUI =
  | { type: 'analysis-result'; elements: UnconnectedElement[]; totalNodes: number; availableStyles: AvailableStyle[] }
  | { type: 'connection-success'; nodeId: string }
  | { type: 'style-created'; nodeId: string; styleName: string }
  | { type: 'error'; message: string }
  | { type: 'no-selection' };

// Paint style with color information
export interface PaintStyleInfo {
  id: string;
  name: string;
  color: ColorValue;
}

// Text style with typography information
export interface TextStyleInfo {
  id: string;
  name: string;
  typography: TypographyValue;
}

// Color variable information
export interface ColorVariableInfo {
  id: string;
  name: string;
  color: ColorValue;
}

// Available style for dropdown selection
export interface AvailableStyle {
  id: string;
  name: string;
  type: 'color' | 'typography';
  color?: ColorValue; // For color styles
  typography?: TypographyValue; // For text styles
}

