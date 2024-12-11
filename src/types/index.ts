export interface Station {
  id: number;
  name: string;
  nameJa: string;
  lat: number;
  lng: number;
  checkedIn: boolean;
  checkedInAt?: string;
  isStartPoint?: boolean;
  isGoalPoint?: boolean;
  startCheckedIn?: boolean;
  goalCheckedIn?: boolean;
}

export interface Settings {
  startStation: number | null;
  direction: 'clockwise' | 'counterclockwise';
  bypassLocationCheck: boolean;
}

export interface AppState {
  stations: Station[];
  settings: Settings;
}