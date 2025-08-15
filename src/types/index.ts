// Card Types
export interface Card {
  name: string;
  faceUp?: boolean;
  reversed?: boolean;
  suit?: string;
  rank?: string | number;
  arcana?: 'major' | 'minor';
  element?: string;
  keywords?: string[];
  [key: string]: any;
}

// Spread Types
export interface SpreadPosition {
  id: string;
  area: string;
  label: string;
  description?: string;
}

export interface SpreadSpec {
  name: string;
  description?: string;
  positions: SpreadPosition[];
  templates: Record<string, string>;
  columns: Record<string, string>;
  rows: Record<string, string>;
}

// Interpretation Types
export interface Interpretation {
  card: Card;
  pos: SpreadPosition;
  text: string;
  timestamp?: Date;
}

// Deck Statistics
export interface DeckStatistics {
  total: number;
  reversed: number;
  reversalRate: string;
  runCount: number;
  longestReversedRun: number;
  longestUprightRun: number;
}

// AI Request Types
export interface InterpretationRequest {
  question: string;
  spreadName: string;
  positions: SpreadPosition[];
  focusPositionId: string;
  draws: Array<{ positionId: string; card: Card }>;
  prior: Array<{ positionId: string; text: string }>;
  styleSentence?: string;
}

// Component Event Types
export interface CardStateChange {
  card: Card;
  field: string;
  value: any;
}

// Session Types
export interface SessionInfo {
  spreadName: string;
  cardsDealt: number;
  cardsRevealed: number;
  startTime?: Date;
  interpretations?: number;
}
