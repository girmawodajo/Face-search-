
export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
}

export interface AppState {
  isSearching: boolean;
  error: string | null;
  image: string | null; // base64
  results: SearchResult[];
  explanation: string | null;
}

export enum View {
  HOME = 'HOME',
  CAMERA = 'CAMERA',
  RESULTS = 'RESULTS'
}
